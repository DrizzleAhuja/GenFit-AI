# 🚀 GenFit AI - Complete System Architecture & Defense Document
*Use this document to prepare for Hackathon Q&A, Judges' Questions, and Technical defense.*

---

## 1. 🏆 Leaderboard & Point Distribution
**Packages Used:** `mongoose` (Backend Aggregation), `lucide-react` (Frontend Icons).
**How points are distributed:** Score = (Sessions * 10) + (Total Calories Burned / 50) * Streak Multiplier.
**Implementation Snippet:**
```javascript
// Backend (Node.js/Mongoose) Aggregation Pipeline
const leaderboard = await SessionLog.aggregate([
  { $group: { _id: "$userId", totalCalories: { $sum: "$caloriesBurned" }, totalSessions: { $sum: 1 } } },
  { $addFields: { score: { $add: [{ $multiply: ["$totalSessions", 10] }, { $divide: ["$totalCalories", 50] }] } } },
  { $sort: { score: -1 } }
]);
```

---

## 2. 🧘‍♂️ MindFit (Holistic Recovery)
**Packages Used:** `react-native-reanimated` (Smooth UI scaling for breathing), `lucide-react` (Icons).
**How it works:** Real-time guided breathing relies on CSS animations and React Native Reanimated hooks to expand and contract a visual ring.
**Implementation Snippet:**
```javascript
// Mobile App - Animated Breathing Ring
const scale = useSharedValue(1);

const startBreathing = () => {
  // Inhale (Scale up in 4s), Hold, Exhale (Scale down in 4s)
  scale.value = withRepeat(
    withSequence(
      withTiming(1.5, { duration: 4000 }), // Inhale
      withTiming(1, { duration: 4000 })    // Exhale
    ), -1, true
  );
};
```

---

## 3. 🍎 Calorie & Macro Tracker
**Packages Used:** `@google/generative-ai` (Gemini Vision), `axios` (API fetching), `recharts` / `react-native-svg` (Progress visualizing).
**How it works:** Instead of a rigid database like Edamam, this system uses the **Gemini Vision API (Multimodal AI)**. When a user uploads a food image, Gemini analyzes the image, identifies the food (like Samosa or Paneer), estimates the serving size visually, and returns a structured JSON containing calories, protein, carbs, and fats. 
**Implementation Snippet:**
```javascript
// Frontend React - SVG Circular Progress
const ProgressRing = ({ consumed, target }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const fillPercentage = Math.min((consumed / target) * 100, 100);
  const strokeDashoffset = circumference - (fillPercentage / 100) * circumference;

  return (
    <svg width="120" height="120">
      <circle cx="60" cy="60" r={radius} stroke="#1F2937" strokeWidth="10" fill="none" />
      <circle cx="60" cy="60" r={radius} stroke="#22D3EE" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
    </svg>
  );
};
```

---

## 4. 🤖 VTA (Virtual Training Assistant / Posture Coach)
**Packages Used:** 
* Web/Core: `@tensorflow/tfjs`, `@tensorflow-models/pose-detection` (MoveNet)
* Narration: Native `window.speechSynthesis` (Web) and `expo-speech` (Mobile)
**How it works:** The web uses TensorFlow MoveNet to extract vectors of 17 body joints from the camera feed via `react-webcam`. The X/Y vectors calculate joint angles. If an angle is bad (e.g. back not straight), the app uses native Text-to-Speech (`window.speechSynthesis`) to provide instant verbal Q&A narration and form correction! Mobile uses a crash-free "Edge AI Lite" simulation to prevent RAM overload on Android devices.
**Implementation Snippet:**
```javascript
// Vector Math for Angle Calculation (TensorFlow.js)
function calculateAngle(A, B, C) {
  // Angle at B between vectors BA and BC
  const BAx = A.x - B.x, BAy = A.y - B.y;
  const BCx = C.x - B.x, BCy = C.y - B.y;
  const dotProduct = (BAx * BCx) + (BAy * BCy);
  const magnitude = Math.hypot(BAx, BAy) * Math.hypot(BCx, BCy);
  return Math.acos(dotProduct / magnitude) * (180 / Math.PI);
}
// If Hip-Knee-Ankle angle < 90 deg, Count 1 Squat!
```

---

## 5. 👑 Admin Dashboard (Secure Routing & RBAC)
**Packages Used:** `jsonwebtoken` (Auth Tokens), `bcryptjs` (Password Security), `cors` (Security).
**How it works:** Role Based Access Control (RBAC). Only users with `role: "admin"` in MongoDB can access the dash or the API routes. 
**Implementation Snippet:**
```javascript
// Backend Middleware - Admin Protection
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  if (decoded.role !== 'admin') {
    return res.status(403).json({ error: "Access Denied. Admins Only." });
  }
  next();
};
// Route Usage
app.get('/api/admin/stats', verifyAdmin, getStatsController);
```

---

## 6. 🧠 Agentic FitBot Chatbot
**Packages Used:** `@google/generative-ai` (Gemini SDK), `react-markdown` (Formatting bot replies).
**How it works:** Features an "Agentic" chat history array. Every time the user asks a question, the entire array + a hidden System Prompt is mapped and sent to the Gemini 1.5 API so it remembers context. 
**Usage & Limits:** This utilizes the Google Gemini Free Tier, which provides a massive generous limit of *15 Requests Per Minute (RPM)*, *1 Million Tokens Per Minute*, and *1,500 Requests Per Day (RPD)* entirely for free!
**Implementation Snippet:**
```javascript
// Node.js Backend - Gemini Integration
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

const fitnessPrompt = "You are GenFit AI, an expert Indian fitness coach...";

const chat = model.startChat({
  history: [
    { role: "user", parts: [{ text: fitnessPrompt }] },
    // Inject previous msgs here so it remembers context
  ]
});

const result = await chat.sendMessage(userNewMessage);
console.log(result.response.text());
```

---

## 7. 💳 Razorpay Payment Gateway (PRO Upgrade)
**Packages Used:** `razorpay` (Node.js SDK), `crypto` (HMAC SHA-256 for Security), `react-razorpay` (Frontend UI injection).
**How it works:** 
1. User clicks "Upgrade to PRO (₹199)".
2. Node Backend calls `razorpay.orders.create({ amount: 19900 })` and returns an `order_id`.
3. Frontend opens the Razorpay Modal.
4. On success, Razorpay gives a signature. Backend runs `crypto.createHmac('sha256', secret)` to verify the signature strictly. If verified, the user's role in MongoDB is promoted to `pro`.
**Test Credentials:**
* Card Number: `4111 1111 1111 1111` (CVV: `123`, Expiry: Any Future Date)
* UPI ID: `success@razorpay`
**Implementation Snippet:**
```javascript
// Backend - HMAC Signature Verification
const crypto = require("crypto");

const verifyPayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    // Payment Authentic! Upgrade user to PRO in DB.
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: "Fraudulent transaction detected!" });
  }
};
```
