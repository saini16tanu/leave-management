const User = require("../models/userModel");
const LeaveRequest = require("../models/leaveRequestModel");
const { getTodayIST } = require("../utils/leaveUtils");

const dashboardController = {
  // numbers and lists for the admin dashboard
  getStats: async (req, res) => {
    // counts
    const totalEmployees = await User.countDocuments({ role: "employee" });
    const totalRequests = await LeaveRequest.countDocuments();
    const pendingCount = await LeaveRequest.countDocuments({ status: "pending" });
    const approvedCount = await LeaveRequest.countDocuments({ status: "approved" });
    const rejectedCount = await LeaveRequest.countDocuments({ status: "rejected" });
    const cancelledCount = await LeaveRequest.countDocuments({ status: "cancelled" });

    // employees who are on approved leave today
    const today = getTodayIST();
    const todayLeaves = await LeaveRequest.find({
      status: "approved",
      fromDate: { $lte: today },
      toDate: { $gte: today },
    })
      .populate("employee", "name employeeId department")
      .populate("leaveType", "name");

    const onLeaveToday = [];
    for (const leave of todayLeaves) {
      // skip if the employee or leave type was deleted
      if (!leave.employee || !leave.leaveType) {
        continue;
      }
      onLeaveToday.push({
        name: leave.employee.name,
        employeeId: leave.employee.employeeId,
        department: leave.employee.department,
        leaveType: leave.leaveType.name,
        fromDate: leave.fromDate,
        toDate: leave.toDate,
      });
    }

    // count approved leaves for each department
    const departmentCount = {};

    // start every department that has employees at 0
    const employees = await User.find({ role: "employee" });
    for (const employee of employees) {
      departmentCount[employee.department] = 0;
    }

    const approvedLeaves = await LeaveRequest.find({ status: "approved" }).populate("employee", "department");
    for (const leave of approvedLeaves) {
      if (!leave.employee) {
        continue;
      }
      const department = leave.employee.department;
      if (departmentCount[department] === undefined) {
        departmentCount[department] = 0;
      }
      departmentCount[department] = departmentCount[department] + 1;
    }

    // change the object into a list
    const departmentWise = [];
    for (const department in departmentCount) {
      departmentWise.push({ department: department, count: departmentCount[department] });
    }

    res.status(200).json({
      totalEmployees,
      totalRequests,
      pendingCount,
      approvedCount,
      rejectedCount,
      cancelledCount,
      onLeaveToday,
      departmentWise,
    });
  },
};

module.exports = dashboardController;
