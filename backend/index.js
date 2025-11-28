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

// ✅ CORS config - MUST BE FIRST before any other middleware
const allowedOrigins = [
  "https://genfitai.vercel.app",
  "https://www.genfitai.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

// ✅ Handle OPTIONS preflight requests FIRST (before CORS middleware)
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Log for debugging
  console.log(`[${req.method}] ${req.path} - Origin: ${origin || "none"}`);

  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    // Always allow OPTIONS from genfitai.vercel.app or any of our allowed origins
    let allowedOrigin = null;

    if (origin && allowedOrigins.includes(origin)) {
      allowedOrigin = origin;
    } else if (origin && origin.includes("genfitai.vercel.app")) {
      // Allow any genfitai.vercel.app subdomain
      allowedOrigin = origin;
    } else if (!origin) {
      // No origin header (some proxies strip it) - use default
      allowedOrigin = allowedOrigins[0];
    } else {
      // Unknown origin - log it but still allow for debugging
      console.log("⚠️ OPTIONS from unknown origin:", origin, "- Allowing anyway");
      allowedOrigin = origin; // Allow it for now
    }

    if (allowedOrigin) {
      res.header("Access-Control-Allow-Origin", allowedOrigin);
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept, Origin"
      );
      res.header("Access-Control-Max-Age", "86400");
      console.log("✅ OPTIONS request allowed for origin:", allowedOrigin);
      return res.status(204).end();
    }
  }

  next();
});

// ✅ CORS middleware with lenient origin checking
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (server-to-server, mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow genfitai.vercel.app subdomains (flexible matching)
    if (origin && origin.includes("genfitai.vercel.app")) {
      console.log("✅ Allowing genfitai.vercel.app origin:", origin);
      return callback(null, true);
    }

    // Log blocked origin for debugging
    console.log("⚠️ CORS blocked origin:", origin);
    console.log("Allowed origins:", allowedOrigins);

    // For now, allow all origins to prevent blocking (you can restrict later)
    // To make it strict, uncomment the line below:
    // return callback(new Error("Not allowed by CORS"));

    // Temporarily allow all origins for debugging
    return callback(null, true);
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

// ✅ Additional CORS headers middleware (backup)
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Set CORS headers for allowed origins
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  } else if (!origin && req.method === "OPTIONS") {
    // Handle OPTIONS without origin
    res.header("Access-Control-Allow-Origin", allowedOrigins[0]);
    res.header("Access-Control-Allow-Credentials", "true");
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept, Origin"
  );

  next();
});

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

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
  console.error("Error Message:", err.message);
  console.error("Request Origin:", req.headers.origin);
  console.error("Request Method:", req.method);
  console.error("Request Path:", req.path);

  // Handle CORS errors specifically - but don't block, just log
  if (err.message === "Not allowed by CORS") {
    console.error("⚠️ CORS Error - but allowing request for debugging");
    // Set CORS headers anyway for debugging
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
    }
  }

  // Don't return error for CORS issues in production debugging
  if (err.message === "Not allowed by CORS") {
    return next(); // Continue to next middleware
  }

  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
});

// ✅ Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
