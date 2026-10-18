const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const createToken = require("../utils/createToken");

const authController = {
  // register a new employee
  register: async (req, res) => {
    const { name, email, password, employeeId, department, designation, joiningDate } = req.body;

    // check that all fields are filled
    if (!name || !email || !password || !employeeId || !department || !designation || !joiningDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // check if the email or employee ID is already used
    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const idExists = await User.findOne({ employeeId: employeeId });
    if (idExists) {
      return res.status(409).json({ message: "Employee ID is already registered" });
    }

    // hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // role is always "employee" here, admin is added by the seed script
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "employee",
      employeeId,
      department,
      designation,
      joiningDate,
    });

    res.status(201).json({ message: "Registered successfully. Please login." });
  },

  // login with email and password
  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // same message for wrong email and wrong password
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = createToken(user);

    // send user details without the password
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.department,
        designation: user.designation,
        joiningDate: user.joiningDate,
      },
    });
  },

  // get the logged in user's details
  getMe: async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  },
};

module.exports = authController;
