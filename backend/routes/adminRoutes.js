const express = require("express");
const router = express.Router();
const { getStats, getUsers, updateUserPlan, getUserLogs, getMessages } = require("../controllers/adminController");

const authMiddleware = require("../middlewares/authMiddleware");
const { adminAuth } = require("../middlewares/authMiddleware");

// Apply authentication and admin check to all routes in this file
router.use(authMiddleware);
router.use(adminAuth);

router.get("/stats", getStats);
router.get("/users", getUsers);
router.put("/users/:id/plan", updateUserPlan);
router.get("/user-logs", getUserLogs);
router.get("/messages", getMessages);


module.exports = router;
