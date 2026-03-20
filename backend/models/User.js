const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false, // Make password optional
  },
  username: {
    type: String,
    required: false, // Make username optional
  },
  role: {
    type: String,
    required: false, // Add role field, required
  },
  workoutPlans: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutPlan',
    },
  ],
  workoutSessionLogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutSessionLog',
    },
  ],
  diseases: {
    type: [String],
    default: [],
  },
  allergies: {
    type: [String],
    default: [],
  },
  // Sports preferences
  sportsPreferences: {
    preferredSports: { type: [String], default: [] },
    sportLevel: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    sportGoals: { type: [String], default: [] },
  },
  // Gamification
  points: { type: Number, default: 0 },
  weeklyPoints: { type: Number, default: 0 },
  weeklyStartAt: { type: Date, default: null },
  streakCount: { type: Number, default: 0 },
  lastActivityAt: { type: Date, default: null },
  // Badges & Weekly Challenge
  badges: { type: [String], default: [] },
  weeklyChallenge: {
    title: { type: String, default: "Log 3 workouts this week" },
    target: { type: Number, default: 3 },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    weekStartAt: { type: Date, default: null },
  },
  // Google Fit integration (optional)
  googleFitLinked: { type: Boolean, default: false },
  googleFit: {
    refreshToken: { type: String, select: false, default: null },
    lastSyncedSteps: { type: Number, default: 0 },
    lastSyncAt: { type: Date, default: null },
  },
  avatar: { type: String, default: "" },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
