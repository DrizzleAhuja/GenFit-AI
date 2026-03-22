const mongoose = require("mongoose");
// backend/models/BMI.js
const BMISchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  heightFeet: { type: Number, required: true }, // in feet
  heightInches: { type: Number, required: true }, // in inches
  weight: { type: Number, required: true }, // in kg
  age: { type: Number, required: true },
  diseases: [{ type: String }], // array of diseases
  allergies: [{ type: String }], // array of allergies
  bmi: { type: Number, required: true },
  category: { type: String, required: true },
  selectedPlan: {
    type: String,
    enum: ["lose_weight", "gain_weight", "build_muscles"],
    default: null,
  },
  targetWeight: { type: Number }, // Target weight in kg
  targetTimeline: { type: String }, // Target timeline (e.g., "6 months")
  aiSuggestions: { type: String }, // Gemini AI suggestions
  date: { type: Date, default: Date.now },
});

BMISchema.post('save', async function(doc) {

  try {
    const User = mongoose.model('User');
    const UserLog = mongoose.model('UserLog');
    const user = await User.findById(doc.userId);
    if (user) {
      await UserLog.create({
        userId: doc.userId,
        userEmail: user.email,
        action: `Calculated BMI: ${doc.bmi} (${doc.category})`
      });
    }
  } catch (err) {
    console.error("UserLog Error (BMI):", err);
  }
});

module.exports = mongoose.model("BMI", BMISchema);

