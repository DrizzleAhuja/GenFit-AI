import mongoose from "mongoose";

const CalorieIntakeLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    totalCalories: { type: Number, required: true },
    source: { type: String, default: "image" }, // e.g. "image", "manual", "text"
    notes: { type: String },
    waterIntake: { type: Number, default: 0 }, // tracks glasses of water
    // Optional breakdown of what was eaten for this log
    items: [
      {
        name: { type: String, required: true },
        caloriesPerItem: { type: Number, required: true },
        quantity: { type: Number, default: 1 },
        totalCalories: { type: Number, required: true },
        mealType: { type: String, enum: ["Breakfast", "Lunch", "Evening Snack", "Dinner", "Other"], default: "Other" },
      },
    ],
  },
  { timestamps: true }
);

// Ensure one log per user per day (last-write-wins semantics)
CalorieIntakeLogSchema.index({ userId: 1, date: 1 });

const CalorieIntakeLog = mongoose.model("CalorieIntakeLog", CalorieIntakeLogSchema);

export default CalorieIntakeLog;

