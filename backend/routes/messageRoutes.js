const express = require("express");
const router = express.Router();
const { sendMessage } = require("../controllers/messageController");

// Public or User authenticated endpoint to submit feedback/contact messages
router.post("/", sendMessage);

module.exports = router;
