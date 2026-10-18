const mongoose = require("mongoose");

// schema for types of leave like Casual, Sick, Earned
const leaveTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Leave type name is required"],
      unique: true,
      trim: true,
    },
    // how many days of this leave an employee gets in one year
    yearlyQuota: {
      type: Number,
      required: [true, "Yearly quota is required"],
      min: [1, "Yearly quota must be at least 1 day"],
      max: [60, "Yearly quota cannot be more than 60 days"],
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaveType", leaveTypeSchema);
