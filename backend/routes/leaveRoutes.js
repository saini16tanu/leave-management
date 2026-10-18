const express = require("express");
const route = express.Router();
const leaveController = require("../controllers/leaveController");
const { authHandler, allowRoles } = require("../middleware/authHandler");

// /api/leaves
// employee routes ("/my" routes must come before "/:id")
route.post("/", authHandler, allowRoles("employee"), leaveController.apply);
route.get("/my", authHandler, allowRoles("employee"), leaveController.getMyLeaves);
route.get("/my/balance", authHandler, allowRoles("employee"), leaveController.getMyBalance);
route.patch("/:id/cancel", authHandler, allowRoles("employee"), leaveController.cancel);

// admin routes
route.get("/", authHandler, allowRoles("admin"), leaveController.getAll);
route.patch("/:id/review", authHandler, allowRoles("admin"), leaveController.review);

// employee and admin both can see one leave
route.get("/:id", authHandler, leaveController.getOne);

module.exports = route;
