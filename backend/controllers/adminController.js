const User = require("../models/User");
const WorkoutSessionLog = require("../models/WorkoutSessionLog").default || require("../models/WorkoutSessionLog");
const PostureSessionLog = require("../models/PostureSessionLog").default || require("../models/PostureSessionLog");
const {
  expireEndedWeeklyChallenges,
  getAdminCurrentChallengeSample,
} = require("../utils/weeklyChallengeExpiry");

function serializeWeeklyChallengeForApi(challenge) {
  if (!challenge) return null;
  const o = {
    title: challenge.title,
    target: challenge.target,
    progress: challenge.progress,
    completed: challenge.completed,
    points: challenge.points,
    type: challenge.type,
  };
  const ws = challenge.weekStartAt;
  const we = challenge.weekEndAt;
  o.weekStartAt =
    ws != null && ws !== ""
      ? (() => {
          const d = new Date(ws);
          return Number.isNaN(d.getTime()) ? null : d.toISOString();
        })()
      : null;
  o.weekEndAt =
    we != null && we !== ""
      ? (() => {
          const d = new Date(we);
          return Number.isNaN(d.getTime()) ? null : d.toISOString();
        })()
      : null;
  return o;
}


// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const proUsers = await User.countDocuments({ plan: "pro" });
    const freeUsers = await User.countDocuments({ plan: "free" });

    const planBreakdown = [
      { name: "Free", value: freeUsers },
      { name: "Pro", value: proUsers }
    ];

    const totalWorkouts = await WorkoutSessionLog.countDocuments();
    const totalPostureSessions = await PostureSessionLog.countDocuments();

    // Get recent 5 users (sorting by _id to get newest)
    const recentUsers = await User.find()
      .select("firstName lastName email plan")
      .sort({ _id: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        proUsers,
        freeUsers,
        planBreakdown,
        totalWorkouts,
        totalPostureSessions,
        recentUsers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get All Users with search and pagination
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password")
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Update User Plan
// @route   PUT /api/admin/users/:id/plan
// @access  Private (Admin)
const updateUserPlan = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!["free", "pro"].includes(plan)) {
      return res.status(400).json({ success: false, message: "Invalid plan type" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { plan }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User plan updated", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get User Audit Logs
// @route   GET /api/admin/user-logs
// @access  Private (Admin)
const getUserLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";

    const UserLog = require("../models/userLogModel");

    const query = {};
    if (search) {
      query.$or = [
        { userEmail: { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } }
      ];
    }

    const totalLogs = await UserLog.countDocuments(query);
    const logs = await UserLog.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        totalLogs,
        totalPages: Math.ceil(totalLogs / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get Feedback / Messages
// @route   GET /api/admin/messages
// @access  Private (Admin)
const getMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { type } = req.query;

    const Message = require("../models/Message");
    const filter = type ? { type } : {};

    const totalMessages = await Message.countDocuments(filter);
    const messages = await Message.find(filter)
      .populate("user", "firstName lastName email")

      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get Income Stats
// @route   GET /api/admin/income
// @access  Private (Admin)
const getIncomeStats = async (req, res) => {
  try {
    const User = require("../models/User");
    
    // Backfill existing pro users missing the date for retroactive charts safety
    await User.updateMany(
      { plan: "pro", proUpgradedAt: null },
      [ { $set: { proUpgradedAt: "$createdAt" } } ]
    );

    const proUsersCount = await User.countDocuments({ plan: "pro" });
    const freeUsersCount = await User.countDocuments({ plan: "free" });
    const totalUsers = proUsersCount + freeUsersCount;
    const rate = 199; // ₹199 INR
    const estimatedMonthlyIncome = proUsersCount * rate;

    // Aggregate users by month of upgrade
    const monthlyStats = await User.aggregate([
      { $match: { plan: "pro", proUpgradedAt: { $ne: null } } },
      {
        $group: {
          _id: { $month: "$proUpgradedAt" },
          revenue: { $sum: rate }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const chartData = [];

    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      if (m <= 0) m += 12;
      const stat = monthlyStats.find(s => s._id === m);
      chartData.push({
        month: monthNames[m - 1],
        revenue: stat ? stat.revenue : 0
      });
    }

    res.status(200).json({
      success: true,
      data: {
        proUsers: proUsersCount,
        freeUsers: freeUsersCount,
        totalUsers,
        rate,
        estimatedMonthlyIncome,
        currency: "INR",
        chartData
      }
    });
  } catch (error) {

    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};


// @desc    Create/Update Weekly Challenge for all users
// @route   POST /api/admin/create-challenge
// @access  Private (Admin)
const createWeeklyChallenge = async (req, res) => {
  try {
    const { title, target, points, startDate, endDate, type } = req.body;
    const User = require("../models/User");
    const Notification = require("../models/Notification");

    if (!title || !target) {
      return res.status(400).json({ success: false, message: "Title and Target are required" });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "Start date and end date are required" });
    }

    const weekStart = new Date(startDate);
    const weekEnd = new Date(endDate);
    if (Number.isNaN(weekStart.getTime()) || Number.isNaN(weekEnd.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid start or end date" });
    }
    if (weekEnd < weekStart) {
      return res.status(400).json({ success: false, message: "End date must be on or after start date" });
    }

    await expireEndedWeeklyChallenges();
    const activeAdmin = await getAdminCurrentChallengeSample();
    if (activeAdmin && activeAdmin.title) {
      const endHint =
        activeAdmin.weekEndAt != null && activeAdmin.weekEndAt !== ""
          ? new Date(activeAdmin.weekEndAt).toLocaleDateString()
          : "no end date set";
      return res.status(400).json({
        success: false,
        message: `A weekly challenge is already active (“${activeAdmin.title}”, ends: ${endHint}). Use Edit to change it or Delete to remove it before creating a new one.`,
      });
    }

    const challengeConfig = {
      title,
      target: parseInt(target, 10),
      points: parseInt(points, 10) || 30,
      type: type || "workout",
      weekStartAt: weekStart,
      weekEndAt: weekEnd,
      progress: 0,
      completed: false
    };

    // Update all users
    await User.updateMany({}, {
      $set: { weeklyChallenge: challengeConfig }
    });

    // Broadcast Notification
    const users = await User.find({}, "_id");
    if (users.length > 0) {
      const notifications = users.map(u => ({
        userId: u._id,
        title: "New Weekly Challenge Started!",
        message: `${title} - Win ${parseInt(points, 10) || 30} points! Ends: ${weekEnd.toLocaleDateString()}`,
        type: "system"
      }));
      await Notification.insertMany(notifications);
    }

    res.status(200).json({ success: true, message: "Weekly Challenge Created & Disseminated successfully", data: challengeConfig });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get Current Weekly Challenge
// @route   GET /api/admin/current-challenge
const getCurrentChallenge = async (req, res) => {
  try {
    await expireEndedWeeklyChallenges();
    const raw = await getAdminCurrentChallengeSample();
    res.status(200).json({
      success: true,
      data: raw && raw.title ? serializeWeeklyChallengeForApi(raw) : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Update current weekly challenge for all users (keeps each user's progress/completed)
// @route   PUT /api/admin/challenge
const updateWeeklyChallenge = async (req, res) => {
  try {
    const User = require("../models/User");
    const { title, target, points, startDate, endDate, type } = req.body;

    await expireEndedWeeklyChallenges();
    const current = await getAdminCurrentChallengeSample();
    if (!current || !current.title) {
      return res.status(404).json({ success: false, message: "No active weekly challenge to update" });
    }

    if (!title || target === undefined || target === "") {
      return res.status(400).json({ success: false, message: "Title and Target are required" });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "Start date and end date are required" });
    }

    const weekStart = new Date(startDate);
    const weekEnd = new Date(endDate);
    if (Number.isNaN(weekStart.getTime()) || Number.isNaN(weekEnd.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid start or end date" });
    }
    if (weekEnd < weekStart) {
      return res.status(400).json({ success: false, message: "End date must be on or after start date" });
    }

    const targetNum = parseInt(target, 10);
    const pointsNum = parseInt(points, 10) || 30;

    await User.updateMany(
      { "weeklyChallenge.title": { $exists: true, $nin: [null, ""] } },
      {
        $set: {
          "weeklyChallenge.title": title,
          "weeklyChallenge.target": targetNum,
          "weeklyChallenge.points": pointsNum,
          "weeklyChallenge.type": type || "workout",
          "weeklyChallenge.weekStartAt": weekStart,
          "weeklyChallenge.weekEndAt": weekEnd,
        },
      }
    );

    const updated = serializeWeeklyChallengeForApi({
      ...current,
      title,
      target: targetNum,
      points: pointsNum,
      type: type || "workout",
      weekStartAt: weekStart,
      weekEndAt: weekEnd,
    });

    res.status(200).json({
      success: true,
      message: "Weekly challenge updated for all users",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Remove weekly challenge from all users
// @route   DELETE /api/admin/challenge
const deleteWeeklyChallenge = async (req, res) => {
  try {
    const User = require("../models/User");
    await User.updateMany({}, { $unset: { weeklyChallenge: 1 } });
    res.status(200).json({ success: true, message: "Weekly challenge removed for all users" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Acknowledge Message & Send Notification
// @route   POST /api/admin/messages/:id/acknowledge
const acknowledgeMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const Message = require("../models/Message");
    const Notification = require("../models/Notification");

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });

    let targetUserId = message.user;
    if (!targetUserId && message.email) {
      const User = require("../models/User");
      const user = await User.findOne({ email: message.email });
      if (user) targetUserId = user._id;
    }

    if (targetUserId && message.type === 'feedback') {
      const notification = await Notification.create({
        userId: targetUserId,
        title: "Feedback Received!",
        message: `We have received your feedback on '${message.item}' and will work on it!`,
        type: "system"
      });

      // Emit socket notification if user is online
      const { getUserSocket, getIo } = require("../utils/socket");
      const socketId = getUserSocket(targetUserId);
      if (socketId) {
        getIo().to(socketId).emit("newNotification", notification);
      }
    }

    message.acknowledged = true;
    await message.save();

    res.status(200).json({ success: true, message: "Feedback acknowledged and notification sent!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

module.exports = {
  getStats,
  getUsers,
  updateUserPlan,
  getUserLogs,
  getMessages,
  getIncomeStats,
  createWeeklyChallenge,
  getCurrentChallenge,
  updateWeeklyChallenge,
  deleteWeeklyChallenge,
  acknowledgeMessage,
};





