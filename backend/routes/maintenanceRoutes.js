const express = require("express");
const router = express.Router();
const { postDailyTick } = require("../controllers/maintenanceController");

router.post("/daily-tick", postDailyTick);

module.exports = router;
