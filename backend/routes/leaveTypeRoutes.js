const express = require("express");
const route = express.Router();
const leaveTypeController = require("../controllers/leaveTypeController");
const { authHandler, allowRoles } = require("../middleware/authHandler");

// /api/leave-types
// any logged in user can see leave types
route.get("/", authHandler, leaveTypeController.getAll);
route.get("/:id", authHandler, leaveTypeController.getOne);

// only admin can add, edit or delete leave types
route.post("/", authHandler, allowRoles("admin"), leaveTypeController.create);
route.put("/:id", authHandler, allowRoles("admin"), leaveTypeController.update);
route.delete("/:id", authHandler, allowRoles("admin"), leaveTypeController.remove);

module.exports = route;
