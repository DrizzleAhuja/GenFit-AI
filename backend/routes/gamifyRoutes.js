const express = require("express");
const { getStats, getLeaderboard, updatePreferences, getAdherence } = require("../controllers/gamifyController");
const router = express.Router();

router.get("/stats", getStats);
router.get("/leaderboard", getLeaderboard);
router.put("/preferences", updatePreferences);
router.get("/adherence", getAdherence);

module.exports = router;


