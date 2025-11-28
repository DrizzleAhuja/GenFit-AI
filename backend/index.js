const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const bmiRoutes = require("./routes/bmiRoutes");
const gamifyRoutes = require("./routes/gamifyRoutes");
// const messageRoutes = require("./routes/messageRoutes");

const app = express();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// ✅ CORS config (production + localhost) with proper preflight handling
const allowedOrigins = [
  "https://genfitai.vercel.app",
  "https://www.genfitai.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server or curl (no origin)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Log for debugging
    console.log("CORS blocked origin:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-CSRF-Token",
    "Accept",
    "Origin",
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// ✅ Explicitly handle preflight with same options
app.options("*", cors(corsOptions));

// ✅ Extra CORS headers (for platforms with strict proxying)
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;

  // Set CORS headers for allowed origins
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.header("Access-Control-Allow-Origin", requestOrigin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept, Origin"
    );
    res.header("Access-Control-Max-Age", "86400"); // 24 hours
  }

  // Short-circuit preflight requests
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

// ✅ Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// ✅ MongoDB connect
const mongoUrl = process.env.MONGODB_URL;
const mongoDbName = process.env.MONGODB_DB;

mongoose
  .connect(mongoUrl, mongoDbName ? { dbName: mongoDbName } : undefined)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bmi", bmiRoutes);
app.use("/api/gamify", gamifyRoutes);
// app.use("/api", messageRoutes);

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);

  // Handle CORS errors specifically
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      status: "error",
      message: "CORS: Origin not allowed",
      origin: req.headers.origin,
    });
  }

  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
});

// ✅ Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
