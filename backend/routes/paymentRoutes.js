const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");

// Initialize Razorpay
// For safety, warn if keys are missing
const initRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn("⚠️ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Payment flow will fail.");
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// POST /api/payment/create-order
router.post("/create-order", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: "User ID required" });

  const razorpay = initRazorpay();
  if (!razorpay) return res.status(500).json({ success: false, message: "Payment gateway not configured on server." });

  const options = {
    amount: 19900, // INR 199.00 in paise
    currency: "INR",
    receipt: `rcpt_${userId.toString().slice(-8)}_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (err) {
    console.error("Razorpay Create Order Error:", err);
    res.status(500).json({ success: false, message: "Error creating payment order." });
  }
});

// POST /api/payment/verify
router.post("/verify", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
    return res.status(400).json({ success: false, message: "Missing payment fields or userId." });
  }

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.plan = "pro";
        await user.save();
        res.json({ success: true, message: "Payment verified successfully. Welcome to Pro!", user });
      } else {
        res.status(404).json({ success: false, message: "User not found." });
      }
    } catch (e) {
      res.status(500).json({ success: false, message: "Error updating user plan." });
    }
  } else {
    res.status(400).json({ success: false, message: "Invalid payment signature." });
  }
});

module.exports = router;
