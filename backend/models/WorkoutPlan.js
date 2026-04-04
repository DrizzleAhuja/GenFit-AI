import mongoose from 'mongoose';

const ExerciseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: String, required: true }, // Can be '8-12', 'to failure', etc.
    weight: { type: String }, // 'bodyweight', '10kg', 'N/A'
    rest: { type: String }, // '60 seconds', '2 minutes'
    notes: { type: String },
    demonstrationLink: { type: String }, // Optional link to exercise video
}, { _id: false }); // Disable _id for subdocuments

const WorkoutDaySchema = new mongoose.Schema({
    day: { type: String, required: true }, // e.g., 'Monday', 'Day 1'
    focus: { type: String }, // e.g., 'Chest & Triceps', 'Full Body'
    exercises: [ExerciseSchema],
    warmup: { type: String },
    cooldown: { type: String },
}, { _id: false }); // Disable _id for subdocuments

const WorkoutPlanSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        description: { type: String },
        isActive: { type: Boolean, default: false }, // Only one plan can be active at a time
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date }, // Can be set based on durationWeeks or manually
        durationWeeks: { type: Number, default: 4 }, // Default to 4 weeks
        // Optional: track progress per week if needed, e.g., an array of completion status for each week
        // weeklyProgress: [{ weekNumber: Number, completedDays: [String] }],
        currentWeek: { type: Number, default: 1 }, // Track current week for the plan
        completed: { type: Boolean, default: false },
        closedAt: { type: Date },
        weeklyContentOverrides: {
            type: Map, // Map from weekNumber (string) to array of WorkoutDaySchema
            of: [WorkoutDaySchema],
            default: {},
        },
        generatedParams: {
            timeCommitment: { type: String, required: true },
            workoutType: { type: String, required: true },
            intensity: { type: String, required: true },
            equipment: { type: String, required: true },
            daysPerWeek: { type: Number, required: true },
            fitnessGoal: { type: String },
            gender: { type: String },
            strengthLevel: { type: String },
            trainingMethod: { type: String },
            bmiData: { type: Object }, // Store BMI data at the time of generation
        },
        planContent: [WorkoutDaySchema], // Structured plan content
        // Scheduled dates for each workout day
        scheduledDates: {
            type: [new mongoose.Schema({
                date: { type: Date, required: true },
                dayIndex: { type: Number, required: true },
                weekNumber: { type: Number, required: true },
                status: { type: String, enum: ['pending', 'completed', 'missed', 'skipped'], default: 'pending' },
                completedAt: { type: Date },
                /** User chose rest / sick / etc. — does not count as a failed "missed" session */
                skipReason: { type: String, maxlength: 120 },
            }, { _id: false })],
            default: [],
        },
        // Progress tracking
        completedDayCount: { type: Number, default: 0 },
        dayCompletions: {
            type: [
                new mongoose.Schema(
                    {
                        weekNumber: { type: Number, required: true },
                        dayIndex: { type: Number, required: true },
                        sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutSessionLog' },
                        date: { type: Date, default: Date.now },
                    },
                    { _id: false }
                ),
            ],
            default: [],
        },
    },
    { timestamps: true }
);

WorkoutPlanSchema.post('save', async function(doc) {
  try {
    const User = mongoose.model('User');
    const UserLog = mongoose.model('UserLog');
    const user = await User.findById(doc.userId);
    if (user) {
      await UserLog.create({
        userId: doc.userId,
        userEmail: user.email,
        action: `Generated Workout Plan (${doc.name})`
      });
    }
  } catch (err) {
    console.error("UserLog Error (WorkoutPlan):", err);
  }
});

const WorkoutPlan = mongoose.model('WorkoutPlan', WorkoutPlanSchema);


export default WorkoutPlan;
