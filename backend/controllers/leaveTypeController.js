const LeaveType = require("../models/leaveTypeModel");
const LeaveRequest = require("../models/leaveRequestModel");

const leaveTypeController = {
  // get all leave types sorted by name
  getAll: async (req, res) => {
    const leaveTypes = await LeaveType.find().sort({ name: 1 });
    res.status(200).json({ leaveTypes });
  },

  // get one leave type by id
  getOne: async (req, res) => {
    const leaveType = await LeaveType.findById(req.params.id);
    if (!leaveType) {
      return res.status(404).json({ message: "Leave type not found" });
    }
    res.status(200).json({ leaveType });
  },

  // create a new leave type (admin)
  create: async (req, res) => {
    const { name, yearlyQuota, description } = req.body;

    // check if a leave type with this name already exists
    const nameExists = await LeaveType.findOne({ name: name });
    if (nameExists) {
      return res.status(409).json({ message: "A leave type with this name already exists" });
    }

    const leaveType = await LeaveType.create({ name, yearlyQuota, description });
    res.status(201).json({ message: "Leave type created", leaveType });
  },

  // update a leave type (admin)
  update: async (req, res) => {
    const { name, yearlyQuota, description } = req.body;

    // check if another leave type already has this name
    if (name) {
      const nameExists = await LeaveType.findOne({ name: name, _id: { $ne: req.params.id } });
      if (nameExists) {
        return res.status(409).json({ message: "A leave type with this name already exists" });
      }
    }

    // returnDocument "after" gives back the updated data, runValidators checks min/max
    const leaveType = await LeaveType.findByIdAndUpdate(
      req.params.id,
      { name, yearlyQuota, description },
      { returnDocument: "after", runValidators: true }
    );
    if (!leaveType) {
      return res.status(404).json({ message: "Leave type not found" });
    }
    res.status(200).json({ message: "Leave type updated", leaveType });
  },

  // delete a leave type (admin)
  remove: async (req, res) => {
    const leaveType = await LeaveType.findById(req.params.id);
    if (!leaveType) {
      return res.status(404).json({ message: "Leave type not found" });
    }

    // do not delete if any leave request uses this type
    const usedInRequest = await LeaveRequest.findOne({ leaveType: req.params.id });
    if (usedInRequest) {
      return res.status(400).json({ message: "This leave type is used in leave requests, so it cannot be deleted" });
    }

    await LeaveType.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Leave type deleted" });
  },
};

module.exports = leaveTypeController;
