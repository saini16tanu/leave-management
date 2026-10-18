require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const leaveTypeRoutes = require("./routes/leaveTypeRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// connect to the database
connectDB();

// read JSON data from request body
app.use(express.json());

// allow the React frontend to call this API
app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5173"],
  })
);

// test route to check the server is working
app.get("/", (req, res) => {
  res.status(200).json({ message: "Leave Management API is running" });
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/leave-types", leaveTypeRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/dashboard", dashboardRoutes);

// these must be after all routes
app.use(notFound);
app.use(errorHandler);

// start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  // stop if the port is already in use
  if (err) {
    console.log("Server could not start: " + err.message);
    process.exit(1);
  }
  console.log(`Server running on port ${PORT}`);
});
