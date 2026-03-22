const User = require("../models/User");
const WorkoutSessionLog = require("../models/WorkoutSessionLog").default || require("../models/WorkoutSessionLog");
const PostureSessionLog = require("../models/PostureSessionLog").default || require("../models/PostureSessionLog");


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

    const Message = require("../models/Message");

    const totalMessages = await Message.countDocuments();
    const messages = await Message.find()
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

module.exports = { getStats, getUsers, updateUserPlan, getUserLogs, getMessages };

