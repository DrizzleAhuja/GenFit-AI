const mongoose = require("mongoose");

const weeklyChallengeSchema = new mongoose.Schema(
  {
    title: { type: String },
    target: { type: Number },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    weekStartAt: { type: Date },
    weekEndAt: { type: Date },
    points: { type: Number, default: 30 },
    type: {
      type: String,
      enum: ["workout", "posture", "calorie"],
      default: "workout",
    },
  },
  { _id: false }
);

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
  // Badges & Weekly Challenge (omit until admin creates one)
  badges: { type: [String], default: [] },
  weeklyChallenge: { type: weeklyChallengeSchema, required: false, default: undefined },

  // Google Fit integration (optional)
  googleFitLinked: { type: Boolean, default: false },
  googleFit: {
    refreshToken: { type: String, select: false, default: null },
    lastSyncedSteps: { type: Number, default: 0 },
    lastSyncAt: { type: Date, default: null },
  },
  avatar: { type: String, default: "" },
  plan: {
    type: String,
    enum: ["free", "pro"],
    default: "free",
  },
  proUpgradedAt: { type: Date, default: null },

  limits: {
    vtaUsage: { type: Number, default: 0 },
    photoUsage: { type: Number, default: 0 },
    lastResetAt: { type: Date, default: Date.now },
  },
});

userSchema.pre('save', function(next) {
  this._wasModifiedPlan = this.isModified('plan');
  
  if (this._wasModifiedPlan && this.plan === 'pro' && !this.proUpgradedAt) {
    this.proUpgradedAt = new Date();
  }

  this._wasModifiedProfile = this.isModified('firstName') || this.isModified('lastName') || this.isModified('diseases');
  this._wasModifiedVta = this.isModified('limits.vtaUsage');
  next();
});

userSchema.post('save', async function(doc) {
  try {
    const UserLog = mongoose.model('UserLog');
    if (this._wasModifiedPlan) {
      await UserLog.create({
        userId: doc._id,
        userEmail: doc.email,
        action: `Upgraded Plan to ${doc.plan.toUpperCase()}`
      });
    }
    if (this._wasModifiedProfile) {
      await UserLog.create({
        userId: doc._id,
        userEmail: doc.email,
        action: `Updated Profile Details`
      });
    }
    if (this._wasModifiedVta) {
      await UserLog.create({
        userId: doc._id,
        userEmail: doc.email,
        action: `Interacted with AI Chatbot (VTA)`
      });
    }
  } catch (err) {
    console.error("UserLog Error (User):", err);
  }
});

const User = mongoose.model("User", userSchema);


module.exports = User;
