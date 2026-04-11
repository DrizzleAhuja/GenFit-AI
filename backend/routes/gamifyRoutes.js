const express = require("express");
const gamifyController = require("../controllers/gamifyController");
const router = express.Router();

router.get("/stats", gamifyController.getStats);
router.get("/leaderboard", gamifyController.getLeaderboard);
router.get("/adherence", gamifyController.getAdherence);
router.post("/preferences", gamifyController.updatePreferences);
router.post("/weekly-report/generate", gamifyController.generateWeeklyReport);
router.post("/weekly-report/auto-trigger", gamifyController.checkAndAutoGenerateReport);
router.get("/weekly-report/latest", gamifyController.getLatestWeeklyReport);

module.exports = router;
