const mongoose = require("mongoose");

// schema for employees and admins
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // this will store the bcrypt hash, not the plain password
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: {
        values: ["employee", "admin"],
        message: "Role must be employee or admin",
      },
      default: "employee",
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
    },
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
