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

const PostureSessionLog = mongoose.model(
  "PostureSessionLog",
  PostureSessionLogSchema
);

export default PostureSessionLog;

