const express = require("express");
const route = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { authHandler, allowRoles } = require("../middleware/authHandler");

// /api/dashboard (admin only)
route.get("/", authHandler, allowRoles("admin"), dashboardController.getStats);

module.exports = route;
