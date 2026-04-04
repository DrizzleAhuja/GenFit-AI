const express = require("express");
const router = express.Router();
const {
  getStats,
  getUsers,
  updateUserPlan,
  getUserLogs,
  getMessages,
  getIncomeStats,
  createWeeklyChallenge,
  getCurrentChallenge,
  updateWeeklyChallenge,
  deleteWeeklyChallenge,
  acknowledgeMessage,
} = require("../controllers/adminController");




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
router.post("/messages/:id/acknowledge", acknowledgeMessage);
router.get("/income", getIncomeStats);

router.get("/current-challenge", getCurrentChallenge);
router.post("/create-challenge", createWeeklyChallenge);
router.put("/challenge", updateWeeklyChallenge);
router.delete("/challenge", deleteWeeklyChallenge);




module.exports = router;
