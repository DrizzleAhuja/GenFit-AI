// routes/userRoutes.js
const express = require("express");
const { updateUser, getUser } = require("../controllers/userController");
const router = express.Router();

router.get("/:id", getUser);
router.put("/:id", updateUser);


module.exports = router;
