require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

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

// routes will be added here

// start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
