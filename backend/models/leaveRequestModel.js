const mongoose = require("mongoose");

// schema for a leave application made by an employee
const leaveRequestSchema = new mongoose.Schema(
  {
    // the employee who applied (linked to User)
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Employee is required"],
    },
    // which leave type is used (linked to LeaveType)
    leaveType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveType",
      required: [true, "Leave type is required"],
    },
    fromDate: {
      type: Date,
      required: [true, "From date is required"],
    },
    toDate: {
      type: Date,
      required: [true, "To date is required"],
    },
    days: {
      type: Number,
      required: [true, "Number of days is required"],
      min: [1, "Leave must be at least 1 day"],
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
      minlength: [5, "Reason must be at least 5 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected", "cancelled"],
        message: "Status must be pending, approved, rejected or cancelled",
      },
      default: "pending",
    },
    adminRemarks: {
      type: String,
      default: "",
    },
    // the admin who approved or rejected (linked to User)
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
