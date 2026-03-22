require("dotenv").config({ path: "./backend/.env" });
const { connectDB } = require("./backend/db");

const User = require("./backend/models/User");
const WorkoutSessionLog = require("./backend/models/WorkoutSessionLog");
const PostureSessionLog = require("./backend/models/PostureSessionLog");

async function test() {
  try {
    await connectDB();
    console.log("Connected to DB");

    const totalUsers = await User.countDocuments();
    const proUsers = await User.countDocuments({ plan: "pro" });
    const freeUsers = await User.countDocuments({ plan: "free" });

    const totalWorkouts = await WorkoutSessionLog.countDocuments();
    const totalPostureSessions = await PostureSessionLog.countDocuments();

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
    
    console.log("Recent Users:", recentUsers);
    
    process.exit(0);
  } catch (error) {
    console.error("Test Error:", error);
    process.exit(1);
  }
}

test();
