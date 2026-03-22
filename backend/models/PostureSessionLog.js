import mongoose from "mongoose";

const PostureSessionLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    exerciseType: { type: String, required: true },
    reps: { type: Number, default: 0 },
    calories: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

PostureSessionLogSchema.post('save', async function(doc) {
  try {
    const User = mongoose.model('User');
    const UserLog = mongoose.model('UserLog');
    const user = await User.findById(doc.userId);
    if (user) {
      await UserLog.create({
        userId: doc.userId,
        userEmail: user.email,
        action: `Logged a Posture Session (${doc.exerciseType})`
      });
    }
  } catch (err) {
    console.error("UserLog Error (Posture):", err);
  }
});

const PostureSessionLog = mongoose.model(

  "PostureSessionLog",
  PostureSessionLogSchema
);

export default PostureSessionLog;

