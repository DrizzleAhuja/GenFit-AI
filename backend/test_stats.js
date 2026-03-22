require("dotenv").config();
const { connectDB } = require("./db");
const User = require("./models/User");
const WorkoutSessionLog = require("./models/WorkoutSessionLog").default || require("./models/WorkoutSessionLog");
const PostureSessionLog = require("./models/PostureSessionLog").default || require("./models/PostureSessionLog");


async function test() {
  try {
    await connectDB();
    console.log("Connected to DB");

    const totalUsers = await User.countDocuments();
    const proUsers = await User.countDocuments({ plan: "pro" });
    const freeUsers = await User.countDocuments({ plan: "free" });

    let totalWorkouts = 0;
    try {
      totalWorkouts = await WorkoutSessionLog.countDocuments();
    } catch (e) {
      console.log("WorkoutSessionLog fail:", e.message);
    }

    let totalPostureSessions = 0;
    try {
      totalPostureSessions = await PostureSessionLog.countDocuments();
    } catch (e) {
      console.log("PostureSessionLog fail:", e.message);
    }

    console.log({
      totalUsers,
      proUsers,
      freeUsers,
      totalWorkouts,
      totalPostureSessions
    });

    const recentUsers = await User.find()
      .select("firstName lastName email plan")
      .sort({ _id: -1 })
      .limit(5);
    
    console.log("Recent Users count:", recentUsers.length);
    process.exit(0);
  } catch (error) {
    console.error("Test Error:", error);
    process.exit(1);
  }
}

test();
