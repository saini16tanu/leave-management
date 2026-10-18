const express = require("express");
const route = express.Router();
const authController = require("../controllers/authController");
const { authHandler } = require("../middleware/authHandler");

// /api/auth
route.post("/register", authController.register);
route.post("/login", authController.login);
route.get("/me", authHandler, authController.getMe);

module.exports = route;
