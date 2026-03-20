const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, notificationController.getUserNotifications);
router.put("/mark-read", authMiddleware, notificationController.markAllAsRead);
router.put("/:id/mark-read", authMiddleware, notificationController.markAsRead);

module.exports = router;
