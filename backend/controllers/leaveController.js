const LeaveRequest = require("../models/leaveRequestModel");
const LeaveType = require("../models/leaveTypeModel");
const User = require("../models/userModel");
const { toDateOnly, getTodayIST, countLeaveDays, getUsedDays } = require("../utils/leaveUtils");

const allStatuses = ["pending", "approved", "rejected", "cancelled"];

const leaveController = {
  // employee applies for leave
  apply: async (req, res) => {
    const { leaveType, fromDate, toDate, reason } = req.body;

    if (!leaveType || !fromDate || !toDate || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const type = await LeaveType.findById(leaveType);
    if (!type) {
      return res.status(404).json({ message: "Leave type not found" });
    }

    const from = toDateOnly(fromDate);
    const to = toDateOnly(toDate);

    // check that both dates are real dates
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return res.status(400).json({ message: "Please enter valid dates" });
    }

    if (to < from) {
      return res.status(400).json({ message: "End date cannot be before start date" });
    }

    if (from < getTodayIST()) {
      return res.status(400).json({ message: "You cannot apply for leave in the past" });
    }

    if (from.getUTCFullYear() !== to.getUTCFullYear()) {
      return res.status(400).json({ message: "Leave must start and end in the same year" });
    }

    const days = countLeaveDays(from, to);
    if (days === 0) {
      return res.status(400).json({ message: "Selected dates are only Sundays" });
    }

    // check if the employee already has a leave in these dates
    const overlap = await LeaveRequest.findOne({
      employee: req.user.id,
      status: { $in: ["pending", "approved"] },
      fromDate: { $lte: to },
      toDate: { $gte: from },
    });
    if (overlap) {
      return res.status(409).json({ message: "You already have a leave in these dates" });
    }

    // check leave balance (approved + pending days are counted)
    const year = from.getUTCFullYear();
    const usedDays = await getUsedDays(req.user.id, type._id, year, ["approved", "pending"]);
    const remaining = type.yearlyQuota - usedDays;
    if (days > remaining) {
      return res.status(400).json({ message: "Not enough leave balance. Remaining: " + remaining + " days" });
    }

    const leave = await LeaveRequest.create({
      employee: req.user.id,
      leaveType: type._id,
      fromDate: from,
      toDate: to,
      days,
      reason,
      status: "pending",
    });

    res.status(201).json({ message: "Leave applied successfully", leave });
  },

  // employee sees their own leaves
  getMyLeaves: async (req, res) => {
    const filter = { employee: req.user.id };

    // filter by status only if it is a valid status
    if (allStatuses.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const leaves = await LeaveRequest.find(filter)
      .populate("leaveType", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ leaves });
  },

  // employee sees leave balance for every leave type in the current year
  getMyBalance: async (req, res) => {
    const year = getTodayIST().getUTCFullYear();
    const leaveTypes = await LeaveType.find().sort({ name: 1 });

    const balance = [];
    for (const type of leaveTypes) {
      const used = await getUsedDays(req.user.id, type._id, year, ["approved"]);
      const pending = await getUsedDays(req.user.id, type._id, year, ["pending"]);

      balance.push({
        leaveTypeId: type._id,
        name: type.name,
        quota: type.yearlyQuota,
        used: used,
        pending: pending,
        remaining: type.yearlyQuota - used,
      });
    }

    res.status(200).json({ year, balance });
  },

  // employee cancels their own pending leave
  cancel: async (req, res) => {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.employee.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only cancel your own leave" });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({ message: "Only pending leaves can be cancelled" });
    }

    leave.status = "cancelled";
    await leave.save();

    res.status(200).json({ message: "Leave cancelled", leave });
  },

  // get one leave (employee: only own leave, admin: any leave)
  getOne: async (req, res) => {
    const leave = await LeaveRequest.findById(req.params.id)
      .populate("employee", "name employeeId department designation")
      .populate("leaveType", "name")
      .populate("reviewedBy", "name");

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    const isOwner = leave.employee && leave.employee._id.toString() === req.user.id;
    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({ message: "You can only see your own leave" });
    }

    res.status(200).json({ leave });
  },

  // admin sees all leave requests (filter by status and department)
  getAll: async (req, res) => {
    const filter = {};

    if (allStatuses.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    // find employees of that department, then filter leaves by their ids
    if (req.query.department) {
      const users = await User.find({ department: req.query.department });
      const userIds = users.map((user) => user._id);
      filter.employee = { $in: userIds };
    }

    const leaves = await LeaveRequest.find(filter)
      .populate("employee", "name employeeId department designation")
      .populate("leaveType", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ leaves });
  },

  // admin approves or rejects a leave
  review: async (req, res) => {
    const { status, adminRemarks } = req.body;

    if (status !== "approved" && status !== "rejected") {
      return res.status(400).json({ message: "Status must be approved or rejected" });
    }

    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({ message: "This leave is already " + leave.status });
    }

    if (status === "rejected" && (!adminRemarks || adminRemarks.trim() === "")) {
      return res.status(400).json({ message: "Remarks are required when rejecting" });
    }

    // before approving, check balance again using only approved leaves
    if (status === "approved") {
      const type = await LeaveType.findById(leave.leaveType);
      const year = leave.fromDate.getUTCFullYear();
      const approvedDays = await getUsedDays(leave.employee, leave.leaveType, year, ["approved"]);
      const remaining = type.yearlyQuota - approvedDays;
      if (leave.days > remaining) {
        return res.status(400).json({ message: "Employee does not have enough balance" });
      }
    }

    leave.status = status;
    leave.adminRemarks = adminRemarks || "";
    leave.reviewedBy = req.user.id;
    leave.reviewedAt = new Date();
    await leave.save();

    if (status === "approved") {
      return res.status(200).json({ message: "Leave approved", leave });
    }
    res.status(200).json({ message: "Leave rejected", leave });
  },
};

module.exports = leaveController;
