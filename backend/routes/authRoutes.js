const express = require("express");
const router = express.Router();
const Workout = require("../models/Workout");
const User = require("../models/User");
const BMI = require("../models/BMI");
const WorkoutPlan = require("../models/WorkoutPlan").default; // Correct import for default export
const WorkoutSessionLog = require("../models/WorkoutSessionLog").default; // Correct import for default export
const DietChart = require("../models/DietChart");
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");
const { login } = require("../controllers/authController");
const {
  getCurrentUrl,
  GEMINI_API_KEY,
  GEMINI_API_URL,
} = require("../config/config");

function getGoogleFitRedirectUri(req) {
  // Must match an Authorized redirect URI in Google Cloud Console
  // Use explicit env var if set, otherwise construct from backend URL
  if (process.env.GOOGLE_FIT_REDIRECT_URI) {
    return process.env.GOOGLE_FIT_REDIRECT_URI;
  }
  
  // Construct from backend base URL (remove trailing slash if present)
  const baseUrl = getCurrentUrl(req).replace(/\/$/, '');
  const redirectUri = `${baseUrl}/api/auth/google-fit/callback`;
  
  // Log for debugging
  console.log('🔗 [Google Fit] Redirect URI:', redirectUri);
  console.log('🔗 [Google Fit] Backend base URL:', baseUrl);
  
  return redirectUri;
}

function getFrontendRedirectBase() {
  return process.env.FRONTEND_APP_URL || "http://localhost:5173";
}

// Exercises supported by the Virtual Training Assistant (posture coach). Gemini must only use these names so users can train with the assistant.
const VTA_ALLOWED_EXERCISES = [
  "Bench Press", "Incline Dumbbell Press", "Decline Press", "Push-up", "Cable Fly", "Pec Deck", "Chest Press", "Diamond Push-up",
  "Bent-over Row", "Barbell Row", "Lat Pulldown", "Pull-up", "Cable Row", "Single-Arm Row", "T-Bar Row", "Chin-up",
  "Overhead Press", "Military Press", "Arnold Press", "Front Raise", "Lateral Raise", "Reverse Fly", "Face Pull", "Upright Row",
  "Bicep Curl", "Hammer Curl", "Preacher Curl", "Concentration Curl", "Cable Curl", "Barbell Curl", "Incline Curl",
  "Tricep Extension", "Tricep Pushdown", "Skull Crusher", "Overhead Extension", "Kickback", "Close-Grip Bench", "Dips",
  "Back Squat", "Front Squat", "Leg Press", "Goblet Squat", "Walking Lunge", "Reverse Lunge", "Bulgarian Split Squat", "Romanian Deadlift", "Deadlift", "Calf Raise",
  "Plank", "Side Plank", "Mountain Climber", "High Knees", "Forearm Plank", "Hollow Hold", "Dead Bug", "Jumping Jack",
];

router.post("/generate-plan", async (req, res) => {
  try {
    const {
      email,
      fitnessGoal, // This will now be the new 'goal' from frontend
      gender,
      trainingMethod,
      workoutType,
      strengthLevel,
      timeCommitment,
      daysPerWeek,
      bmiData,
      durationWeeks, // Dynamically calculated duration from frontend
      currentWeight,
      targetWeight,
      diseases, // Add diseases
      allergies, // Add allergies
    } = req.body;

    // Validate required fields (updated to include new fields)
    if (
      !email ||
      !fitnessGoal || // This now represents the high-level goal (lose_weight, etc.)
      !gender ||
      !trainingMethod ||
      !workoutType ||
      !strengthLevel ||
      !timeCommitment ||
      !daysPerWeek ||
      !bmiData ||
      !durationWeeks ||
      !currentWeight ||
      ((fitnessGoal === "lose_weight" || fitnessGoal === "gain_weight") &&
        !targetWeight)
    ) {
      return res
        .status(400)
        .json({ error: "All required fields are missing or invalid" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    let specificGoalInstruction = "";
    if (fitnessGoal === "lose_weight") {
      specificGoalInstruction = `The user's goal is to lose weight from ${currentWeight}kg to ${targetWeight}kg over ${durationWeeks} weeks. Focus on creating a plan for safe and effective weight loss.`;
    } else if (fitnessGoal === "gain_weight") {
      specificGoalInstruction = `The user's goal is to gain weight from ${currentWeight}kg to ${targetWeight}kg over ${durationWeeks} weeks. Focus on creating a plan for healthy weight gain and muscle development.`;
    } else if (fitnessGoal === "build_muscles") {
      specificGoalInstruction = `The user's goal is to build muscle mass. Focus on progressive overload and hypertrophy principles over ${durationWeeks} weeks.`;
    }

    // Construct a more detailed prompt for structured output
    const prompt = `Create a detailed ${fitnessGoal} workout plan for a ${gender} at ${strengthLevel} level, with ${daysPerWeek} sessions per week, and ${timeCommitment} minute sessions. 
    Focus on ${trainingMethod} and ${workoutType} equipment. 
    ${specificGoalInstruction}
    The user's BMI data is: ${JSON.stringify(bmiData)}.
    Consider any health conditions from bmiData.diseases or bmiData.allergies to make the plan safe and effective. 
    The user also has the following diseases: ${diseases.join(", ") || "None"}.
    The user also has the following allergies: ${allergies.join(", ") || "None"
      }.

    OUTPUT REQUIREMENTS (STRICT):
    - Return a JSON ARRAY with EXACTLY ${daysPerWeek} objects (representing ONE week's schedule). No more, no less.
    - Use weekday names for 'day': choose an appropriate schedule such as ["Monday","Wednesday","Friday"] for 3 days, ["Monday","Tuesday","Thursday","Saturday"] for 4, etc.
    - Our app will REPEAT this weekly schedule for the specified duration of ${durationWeeks} weeks.
    - Each day object MUST include:
        - 'day' (e.g., 'Monday')
        - optional 'focus' (e.g., 'Chest & Triceps', 'Full Body')
        - 'exercises': an array of exercise objects, each with:
            - 'name' (e.g., 'Bench Press')
            - 'sets' (number)
            - 'reps' (string, e.g., '8-12', 'to failure')
            - 'weight' (string, e.g., 'bodyweight', '10kg', 'N/A')
            - 'rest' (string, e.g., '60 seconds', '2 minutes')
            - optional 'notes'
            - optional 'demonstrationLink' (URL)
        - optional 'warmup' (string)
        - optional 'cooldown' (string)

    VIRTUAL TRAINING ASSISTANT (CRITICAL): Our app has a Virtual Training Assistant that gives form feedback. You MUST use ONLY exercises from this list for the 'name' field (use these names exactly or very close variants like "Push-up" or "Push up"):
    ${VTA_ALLOWED_EXERCISES.join(", ")}
    Do not invent other exercise names. If you need a similar movement, pick the closest match from the list above so users can practice with the assistant.

    IMPORTANT: Return ONLY valid JSON (no markdown/code fences, no extra text).`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.8, // Increased temperature for more creative plans
          maxOutputTokens: 8000, // Increased token limit significantly for detailed plans (from 4000)
          topP: 0.9,
          topK: 20,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 25000, // Increased timeout
      }
    );

    let planContentRaw =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]"; // Default to empty array if plan generation fails

    // Strip markdown code block delimiters if present
    if (planContentRaw.startsWith("```json")) {
      planContentRaw = planContentRaw.substring(7);
    }
    if (planContentRaw.endsWith("```")) {
      planContentRaw = planContentRaw.slice(0, -3);
    }
    planContentRaw = planContentRaw.trim(); // Trim any leading/trailing whitespace

    // Attempt to fix common JSON issues from AI, like unescaped quotes in strings
    // This is a heuristic and might not catch all cases, but addresses common ones.
    planContentRaw = planContentRaw.replace(
      /"(\w+)":\s*"([^"]*)"([^",}\]]*)"([^"]*)"/g,
      (match, p1, p2, p3, p4) => {
        // This regex tries to find an unescaped double quote within a string value.
        // It's tricky to get perfectly right with regex, but this will help with basic cases.
        // A more robust solution might involve a JSON linter/formatter library.
        return `"${p1}": "${p2}\'${p3.replace(/'/g, "\\'")}\'${p4}"`;
      }
    );

    let planContent;
    try {
      planContent = JSON.parse(planContentRaw);
      if (!Array.isArray(planContent)) {
        throw new Error("AI did not return a valid JSON array.");
      }
    } catch (parseError) {
      console.error("Error parsing AI generated plan:", parseError.message);
      console.error("Raw AI response:", planContentRaw);
      return res.status(500).json({
        error: "Failed to parse AI generated workout plan",
        details: parseError.message,
        rawResponse: planContentRaw,
      });
    }

    // Do not save to old Workout model, as we are saving to WorkoutPlan model now upon user request
    // The frontend will call a separate save endpoint

    res.status(201).json({
      success: true,
      plan: planContent, // Send structured plan to frontend
      metadata: {
        fitnessGoal,
        gender,
        trainingMethod,
        workoutType,
        strengthLevel,
        timeCommitment,
        daysPerWeek,
        durationWeeks, // Include durationWeeks in metadata
        currentWeight, // Include currentWeight in metadata
        targetWeight, // Include targetWeight in metadata
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error generating workout plan:", error);
    if (error.response) {
      console.error("Gemini API response error:", error.response.data);
    }
    res.status(500).json({
      error: "Failed to generate workout plan",
      details: error.message,
    });
  }
});

// Helper function to calculate scheduled dates for workouts
function calculateScheduledDates(startDate, daysPerWeek, durationWeeks, planContent) {
  const scheduledDates = [];
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0); // Reset time to start of day
  
  let currentDate = new Date(start);
  const daysInWeek = 7;
  const interval = Math.floor(daysInWeek / daysPerWeek); // Spread workouts evenly
  
  // Generate schedule for all weeks
  for (let week = 1; week <= durationWeeks; week++) {
    // Reset to start of week (same weekday as start date)
    if (week > 1) {
      currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + (week - 1) * 7);
    }
    
    // Schedule workouts for this week
    for (let dayIndex = 0; dayIndex < planContent.length && dayIndex < daysPerWeek; dayIndex++) {
      const workoutDate = new Date(currentDate);
      
      // Distribute workouts evenly across the week
      // For 2 days/week: days 0, 3 (or similar)
      // For 3 days/week: days 0, 2, 4
      // For 4 days/week: days 0, 1, 3, 5
      if (daysPerWeek === 2) {
        workoutDate.setDate(currentDate.getDate() + (dayIndex === 0 ? 0 : 3));
      } else if (daysPerWeek === 3) {
        workoutDate.setDate(currentDate.getDate() + (dayIndex === 0 ? 0 : dayIndex === 1 ? 2 : 4));
      } else if (daysPerWeek === 4) {
        workoutDate.setDate(currentDate.getDate() + (dayIndex === 0 ? 0 : dayIndex === 1 ? 1 : dayIndex === 2 ? 3 : 5));
      } else if (daysPerWeek === 5) {
        workoutDate.setDate(currentDate.getDate() + (dayIndex === 0 ? 0 : dayIndex === 1 ? 1 : dayIndex === 2 ? 2 : dayIndex === 3 ? 4 : 5));
      } else if (daysPerWeek === 6) {
        workoutDate.setDate(currentDate.getDate() + (dayIndex === 0 ? 0 : dayIndex === 1 ? 1 : dayIndex === 2 ? 2 : dayIndex === 3 ? 3 : dayIndex === 4 ? 4 : 5));
      } else {
        // Default: spread evenly
        workoutDate.setDate(currentDate.getDate() + Math.floor(dayIndex * (daysInWeek / daysPerWeek)));
      }
      
      scheduledDates.push({
        date: workoutDate,
        dayIndex: dayIndex,
        weekNumber: week,
        status: 'pending',
      });
    }
  }
  
  return scheduledDates.sort((a, b) => a.date - b.date); // Sort by date
}

// New endpoint to save a workout plan
router.post("/workout-plan/save", async (req, res) => {
  try {
    const {
      userId,
      name,
      description,
      planContent,
      generatedParams,
      durationWeeks,
    } = req.body;

    if (
      !userId ||
      !name ||
      !planContent ||
      !generatedParams ||
      !durationWeeks
    ) {
      return res
        .status(400)
        .json({ error: "Missing required fields to save workout plan" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Deactivate any existing active plans for this user
    await WorkoutPlan.updateMany(
      { userId: userId, isActive: true },
      { isActive: false }
    );

    // Deactivate any existing active diet charts for this user
    await DietChart.updateMany(
      { userId: userId, isActive: true },
      { isActive: false }
    );

    // Calculate start date (today)
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    // Calculate scheduled dates for all workouts
    const scheduledDates = calculateScheduledDates(
      startDate,
      generatedParams.daysPerWeek || planContent.length,
      durationWeeks,
      planContent
    );
    
    // Calculate end date
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationWeeks * 7);

    const workoutPlan = new WorkoutPlan({
      userId,
      name,
      description,
      planContent,
      generatedParams: {
        ...generatedParams,
        durationWeeks,
        diseases: generatedParams.diseases, // Store diseases
        allergies: generatedParams.allergies, // Store allergies
      }, // Ensure durationWeeks is explicitly saved in generatedParams
      durationWeeks,
      isActive: true, // Mark the new plan as active
      startDate: startDate,
      endDate: endDate,
      scheduledDates: scheduledDates,
      currentWeek: 1, // Initialize current week
      completed: false, // Initialize as not completed
      dayCompletions: [], // Initialize empty day completions
      weeklyContentOverrides: new Map(), // Initialize empty map for overrides
    });

    await workoutPlan.save();

    user.workoutPlans.push(workoutPlan._id);
    await user.save();

    // Award points for generating workout plan
    try {
      const { awardPoints } = require("../utils/gamify");
      await awardPoints(userId, "workout_generate");
    } catch (e) {
      console.error("Gamify award error:", e);
    }

    res.status(201).json({
      success: true,
      message: "Workout plan saved successfully and set as active",
      plan: workoutPlan,
    });
  } catch (error) {
    console.error("Error saving workout plan:", error);
    res.status(500).json({
      error: "Failed to save workout plan",
      details: error.message,
    });
  }
});

// New endpoint to get the user's active workout plan
router.get("/workout-plan/active/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    let activePlan = await WorkoutPlan.findOne({ userId, isActive: true });

    if (!activePlan) {
      // Fallback: latest plan (even if completed), useful to show info when no active exists
      activePlan = await WorkoutPlan.findOne({ userId }).sort({
        createdAt: -1,
      });
      if (!activePlan) {
        return res
          .status(404)
          .json({ error: "No active workout plan found for this user" });
      }
    }

    // Fetch workout session logs for the active plan
    const sessionLogs = await WorkoutSessionLog.find({
      workoutPlanId: activePlan._id,
    }).sort({ date: 1 });

    console.log(
      "Backend /workout-plan/active/:userId sending sessionLogs:",
      sessionLogs.map((log) => ({
        weekNumber: log.weekNumber,
        dayIndex: log.dayIndex,
        completedExercises: log.workoutDetails
          .filter((ex) => ex.completed)
          .map((ex) => ex.exerciseName),
      }))
    );

    // Get the plan content for the current week, prioritizing overrides
    const currentWeekPlanContent =
      activePlan.weeklyContentOverrides.get(
        activePlan.currentWeek.toString()
      ) || activePlan.planContent;

    res.status(200).json({
      success: true,
      plan: {
        ...activePlan.toObject(),
        planContent: currentWeekPlanContent, // Ensure we send the correct week's plan content
      },
      sessionLogs,
    });
  } catch (error) {
    console.error("Error fetching active workout plan:", error);
    res.status(500).json({
      error: "Failed to fetch active workout plan",
      details: error.message,
    });
  }
});

// Helper function to mark missed workouts
async function markMissedWorkouts(workoutPlan) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let hasUpdates = false;
  
  if (workoutPlan.scheduledDates && workoutPlan.scheduledDates.length > 0) {
    for (let scheduled of workoutPlan.scheduledDates) {
      const scheduledDate = new Date(scheduled.date);
      scheduledDate.setHours(0, 0, 0, 0);
      
      // If scheduled date is in the past and status is still pending, mark as missed
      if (scheduledDate < today && scheduled.status === 'pending') {
        scheduled.status = 'missed';
        hasUpdates = true;
      }
    }
    
    if (hasUpdates) {
      await workoutPlan.save();
    }
  }
  
  return hasUpdates;
}

// Endpoint to get today's workout only (blocks tomorrow's workout)
router.get("/workout-plan/today/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    let activePlan = await WorkoutPlan.findOne({ userId, isActive: true });
    if (!activePlan) {
      return res.status(404).json({ 
        error: "No active workout plan found",
        todayWorkout: null
      });
    }
    
    // Mark missed workouts
    await markMissedWorkouts(activePlan);
    
    // Refresh plan from DB after marking missed
    activePlan = await WorkoutPlan.findOne({ userId, isActive: true });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find today's scheduled workout
    let todayWorkout = null;
    if (activePlan.scheduledDates && activePlan.scheduledDates.length > 0) {
      const todaySchedule = activePlan.scheduledDates.find(scheduled => {
        const scheduledDate = new Date(scheduled.date);
        scheduledDate.setHours(0, 0, 0, 0);
        return scheduledDate.getTime() === today.getTime();
      });
      
      if (todaySchedule) {
        // Get the workout content for this day
        const dayIndex = todaySchedule.dayIndex;
        const workoutContent = activePlan.planContent[dayIndex];
        
        // Check if already completed today (full day marked complete)
        const isCompleted = todaySchedule.status === 'completed';
        // Always fetch today's session log so UI can show which exercises are done (partial or full)
        const completedSessionLog = await WorkoutSessionLog.findOne({
          workoutPlanId: activePlan._id,
          weekNumber: todaySchedule.weekNumber,
          dayIndex: dayIndex,
          date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
        });
        
        todayWorkout = {
          scheduledDate: todaySchedule.date,
          dayIndex: dayIndex,
          weekNumber: todaySchedule.weekNumber,
          status: todaySchedule.status,
          workoutContent: workoutContent,
          completedSessionLog: completedSessionLog,
          isCompleted: isCompleted,
        };
      }
    }
    
    // Get next workout date (for info)
    let nextWorkoutDate = null;
    if (activePlan.scheduledDates && activePlan.scheduledDates.length > 0) {
      const upcomingSchedules = activePlan.scheduledDates
        .filter(s => {
          const scheduledDate = new Date(s.date);
          scheduledDate.setHours(0, 0, 0, 0);
          return scheduledDate > today && s.status === 'pending';
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      if (upcomingSchedules.length > 0) {
        nextWorkoutDate = upcomingSchedules[0].date;
      }
    }
    
    // Get missed workouts count and details
    const missedSchedules = activePlan.scheduledDates
      ? activePlan.scheduledDates.filter(s => s.status === 'missed')
      : [];
    const missedCount = missedSchedules.length;
    
    // Format missed workouts for display
    const missedWorkoutDetails = missedSchedules.map(scheduled => {
      const workoutContent = activePlan.planContent[scheduled.dayIndex];
      return {
        date: scheduled.date,
        weekNumber: scheduled.weekNumber,
        dayIndex: scheduled.dayIndex,
        focus: workoutContent?.focus || `Day ${scheduled.dayIndex + 1}`,
      };
    });
    
    res.status(200).json({
      success: true,
      todayWorkout: todayWorkout,
      nextWorkoutDate: nextWorkoutDate,
      missedWorkouts: missedCount,
      missedWorkoutDetails: missedWorkoutDetails,
      message: todayWorkout 
        ? (todayWorkout.isCompleted 
            ? "Today's workout is already completed!" 
            : "Today's workout is ready!")
        : "No workout scheduled for today. Rest day!",
    });
  } catch (error) {
    console.error("Error fetching today's workout:", error);
    res.status(500).json({
      error: "Failed to fetch today's workout",
      details: error.message,
    });
  }
});

// New endpoint to get workout session logs for a specific workout plan
router.get("/workout-plan/:planId/sessions", async (req, res) => {
  try {
    const { planId } = req.params;

    const sessionLogs = await WorkoutSessionLog.find({
      workoutPlanId: planId,
    }).sort({ date: 1 });

    res.status(200).json({ success: true, sessionLogs });
  } catch (error) {
    console.error("Error fetching workout sessions for plan:", error);
    res.status(500).json({
      error: "Failed to fetch workout sessions",
      details: error.message,
    });
  }
});

// New endpoint to log a workout session
router.post("/workout-session/log", async (req, res) => {
  try {
    const {
      userId,
      workoutPlanId,
      workoutDetails,
      overallNotes,
      perceivedExertion,
      durationMinutes,
      dayIndex,
      date,
      weekNumber,
    } = req.body;

    if (
      !userId ||
      !workoutPlanId ||
      !workoutDetails ||
      dayIndex === undefined
    ) {
      return res
        .status(400)
        .json({ error: "Missing required fields to log workout session" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const plan = await WorkoutPlan.findById(workoutPlanId);
    if (!plan) return res.status(404).json({ error: "Workout plan not found" });
    if (plan.completed || plan.isActive === false) {
      return res.status(400).json({
        error:
          "This workout plan is closed or completed. Activate a new plan to continue logging.",
      });
    }

    // Use weekNumber from req.body if provided, otherwise compute from date relative to plan.startDate
    const sessionDate = date ? new Date(date) : new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessionDateOnly = new Date(sessionDate);
    sessionDateOnly.setHours(0, 0, 0, 0);
    
    // VALIDATION: Only allow logging today's workout (block future dates)
    if (sessionDateOnly > today) {
      return res.status(400).json({
        error: "Cannot log future workouts. You can only log today's scheduled workout.",
      });
    }
    
    // Check if this workout is scheduled for today
    let scheduledWorkout = null;
    if (plan.scheduledDates && plan.scheduledDates.length > 0) {
      scheduledWorkout = plan.scheduledDates.find(scheduled => {
        const scheduledDate = new Date(scheduled.date);
        scheduledDate.setHours(0, 0, 0, 0);
        return scheduledDate.getTime() === sessionDateOnly.getTime() && 
               scheduled.dayIndex === dayIndex;
      });
      
      if (!scheduledWorkout && sessionDateOnly.getTime() === today.getTime()) {
        return res.status(400).json({
          error: "No workout scheduled for today. Check your plan schedule.",
        });
      }
      
      // If logging for past date (missed workout), allow it but show warning
      if (sessionDateOnly < today && scheduledWorkout) {
        if (scheduledWorkout.status === 'missed') {
          // Allow making up missed workout
          console.log(`User logging missed workout from ${sessionDateOnly.toDateString()}`);
        }
      }
    }
    
    let actualWeekNumber = weekNumber;
    if (actualWeekNumber === undefined) {
      const msInWeek = 7 * 24 * 60 * 60 * 1000;
      actualWeekNumber =
        Math.floor((sessionDate - new Date(plan.startDate)) / msInWeek) + 1;
    }

    console.log("Backend /workout-session/log received:", {
      userId,
      workoutPlanId,
      dayIndex,
      actualWeekNumber,
      workoutDetails: workoutDetails.map((ex) => ({
        name: ex.exerciseName,
        completed: ex.completed,
      })),
    });

    // Get the actual plan content for this specific week and dayIndex, prioritizing overrides
    const currentWeekPlanContent =
      plan.weeklyContentOverrides.get(actualWeekNumber.toString()) ||
      plan.planContent;
    const plannedDayExercises =
      currentWeekPlanContent[dayIndex]?.exercises || [];

    // Find or create workout session log
    let workoutSession = await WorkoutSessionLog.findOne({
      userId,
      workoutPlanId,
      weekNumber: actualWeekNumber,
      dayIndex,
    });

    if (workoutSession) {
      // Merge existing workout details with new ones
      const existingDetailsMap = new Map(
        workoutSession.workoutDetails.map((d) => [d.exerciseName, d])
      );
      workoutDetails.forEach((newDetail) => {
        if (existingDetailsMap.has(newDetail.exerciseName)) {
          // Update existing exercise details
          const existingDetail = existingDetailsMap.get(newDetail.exerciseName);
          existingDetail.sets = newDetail.sets;
          existingDetail.reps = newDetail.reps;
          existingDetail.weight = newDetail.weight;
          existingDetail.notes = newDetail.notes;
          existingDetail.completed = newDetail.completed;
        } else {
          // Add new exercise details if it doesn't exist (shouldn't happen if plan is static, but for safety)
          workoutSession.workoutDetails.push(newDetail);
        }
      });

      // Update other fields
      workoutSession.overallNotes = overallNotes;
      workoutSession.perceivedExertion = perceivedExertion;
      workoutSession.durationMinutes = durationMinutes;
      workoutSession.date = sessionDate; // Update date if logging retroactively
    } else {
      // Create new session log
      workoutSession = new WorkoutSessionLog({
        userId,
        workoutPlanId,
        dayIndex,
        weekNumber: actualWeekNumber,
        date: sessionDate,
        workoutDetails,
        overallNotes,
        perceivedExertion,
        durationMinutes,
      });
    }

    // Determine if all planned exercises for THIS DAY are completed within the workoutSession
    let allPlannedExercisesCompletedForThisDay =
      plannedDayExercises.length > 0 &&
      plannedDayExercises.every((plannedEx) => {
        return workoutSession.workoutDetails.some(
          (loggedEx) =>
            loggedEx.exerciseName === plannedEx.name && loggedEx.completed
        );
      });
    workoutSession.allExercisesCompleted =
      allPlannedExercisesCompletedForThisDay; // Update the session log's own completion status

    await workoutSession.save();
    try {
      const { awardPoints } = require("../utils/gamify");
      await awardPoints(userId, 'workout_log');
    } catch (e) { console.error('Gamify award error:', e); }

    // Link session to user if it's a new session
    if (!user.workoutSessionLogs.includes(workoutSession._id)) {
      user.workoutSessionLogs.push(workoutSession._id);
      await user.save();
    }

    let planUpdated = false;
    const totalDaysPerWeek =
      plan.generatedParams?.daysPerWeek || plan.planContent.length;
    // const uniqueDayCompletionId = `${weekNumber}-${dayIndex}`;
    const wasDayAlreadyCompleted = plan.dayCompletions.some(
      (dc) => dc.weekNumber === actualWeekNumber && dc.dayIndex === dayIndex
    );

    if (allPlannedExercisesCompletedForThisDay && !wasDayAlreadyCompleted) {
      // Mark day as completed in the plan
      plan.dayCompletions.push({
        weekNumber: actualWeekNumber,
        dayIndex,
        sessionId: workoutSession._id,
        date: sessionDate,
      });
      plan.completedDayCount = (plan.completedDayCount || 0) + 1;
      planUpdated = true;
      
      // Update scheduled date status to 'completed'
      if (scheduledWorkout) {
        scheduledWorkout.status = 'completed';
        scheduledWorkout.completedAt = new Date();
        planUpdated = true;
      }
    } else if (
      !allPlannedExercisesCompletedForThisDay &&
      wasDayAlreadyCompleted
    ) {
      // If a day was previously completed but now some exercises are unchecked, unmark it
      plan.dayCompletions = plan.dayCompletions.filter(
        (dc) =>
          !(dc.weekNumber === actualWeekNumber && dc.dayIndex === dayIndex)
      );
      plan.completedDayCount = (plan.completedDayCount || 0) - 1;
      planUpdated = true;
      
      // Revert scheduled date status back to 'pending' or 'missed'
      if (scheduledWorkout) {
        const scheduledDateOnly = new Date(scheduledWorkout.date);
        scheduledDateOnly.setHours(0, 0, 0, 0);
        scheduledWorkout.status = scheduledDateOnly < today ? 'missed' : 'pending';
        scheduledWorkout.completedAt = undefined;
        planUpdated = true;
      }
    }

    // Check for weekly completion and potentially generate next week's plan
    const currentWeekCompletions = plan.dayCompletions.filter(
      (dc) => dc.weekNumber === plan.currentWeek
    );
    if (
      currentWeekCompletions.length >= totalDaysPerWeek &&
      plan.currentWeek === actualWeekNumber
    ) {
      // Current week is completed
      if (plan.currentWeek < plan.durationWeeks) {
        // Move to the next week only if not the final week
        plan.currentWeek += 1;
        planUpdated = true;

        // Generate the next week's plan using AI
        try {
          const gp = plan.generatedParams || {};
          const requestData = {
            email: user.email,
            fitnessGoal: gp.fitnessGoal || "General Fitness",
            gender: user.gender || "Not specified",
            trainingMethod: `${gp.trainingMethod || "mixed"} Training`,
            workoutType: gp.equipment || "none",
            strengthLevel: gp.intensity || "beginner",
            timeCommitment: gp.timeCommitment || "30",
            daysPerWeek: gp.daysPerWeek || plan.planContent.length,
            bmiData: gp.bmiData || {},
            durationWeeks: gp.durationWeeks || 1, // Use generatedParams durationWeeks for regeneration
            currentWeight: gp.currentWeight, // Pass currentWeight for regeneration
            targetWeight: gp.targetWeight, // Pass targetWeight for regeneration
          };
          console.log(`Generating plan for week ${plan.currentWeek}...`);
          const generateResponse = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
              contents: [
                {
                  parts: [
                    {
                      text: `Create a varied workout plan for week ${plan.currentWeek
                        } given the user's initial parameters: ${JSON.stringify(
                          requestData
                        )}. The previous week's plan content was: ${JSON.stringify(
                          plan.planContent
                        )}. Only return the JSON array for this week's plan.`, // Include previous plan content for variation
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 8000,
                topP: 0.9,
                topK: 20,
              },
            },
            {
              headers: { "Content-Type": "application/json" },
              timeout: 30000,
            }
          );

          let newWeeklyPlanRaw =
            generateResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;

          // Strip markdown code fences if present
          if (newWeeklyPlanRaw.startsWith("```json")) {
            newWeeklyPlanRaw = newWeeklyPlanRaw.substring(7);
          }
          if (newWeeklyPlanRaw.endsWith("```")) {
            newWeeklyPlanRaw = newWeeklyPlanRaw.slice(0, -3);
          }
          newWeeklyPlanRaw = newWeeklyPlanRaw.trim();

          let newWeeklyPlanContent;
          try {
            // Attempt to parse the new plan content
            newWeeklyPlanContent = JSON.parse(newWeeklyPlanRaw);
            if (!Array.isArray(newWeeklyPlanContent)) {
              throw new Error(
                "AI did not return a valid JSON array for the new weekly plan."
              );
            }
            // Store the newly generated plan in weeklyContentOverrides
            plan.weeklyContentOverrides.set(
              plan.currentWeek.toString(),
              newWeeklyPlanContent
            );
            console.log(
              `Successfully generated and stored plan for week ${plan.currentWeek} in overrides.`
            );
          } catch (parseError) {
            console.error(
              `Error parsing AI generated plan for week ${plan.currentWeek}:`,
              parseError.message
            );
            console.error(
              "Raw AI response for new weekly plan:",
              newWeeklyPlanRaw
            );
            // If parsing fails, we should not proceed with an invalid plan
            // You might want to add more robust error handling here, e.g., keep the old plan or mark the week as problematic.
            return res.status(500).json({
              error: `Failed to parse AI generated workout plan for week ${plan.currentWeek}`,
              details: parseError.message,
              rawResponse: newWeeklyPlanRaw,
            });
          }

          // Do not overwrite plan.planContent directly here, as weeklyContentOverrides will now manage week-specific plans.
          // plan.planContent = newWeeklyPlanContent; // OLD: This line will be removed or commented out.
        } catch (aiError) {
          console.error(
            `Error generating plan for week ${plan.currentWeek}:`,
            aiError
          );
          // Continue without new plan
        }
      }
    }

    // Check overall plan completion based on completedDayCount
    if (plan.completedDayCount >= plan.durationWeeks * totalDaysPerWeek) {
      plan.completed = true;
      plan.isActive = false;
      plan.closedAt = new Date();
    }

    if (planUpdated) {
      await plan.save();
    }

    res.status(201).json({
      success: true,
      message: "Workout session logged successfully",
      session: workoutSession,
      planProgress: {
        completed: plan.completed,
        completedDayCount: plan.completedDayCount,
        totalDays:
          plan.durationWeeks *
          (plan.generatedParams?.daysPerWeek || plan.planContent.length || 0),
        currentWeek: plan.currentWeek,
        weeklyContentOverrides: Object.fromEntries(plan.weeklyContentOverrides),
      },
    });
  } catch (error) {
    console.error("Error logging workout session:", error);
    res.status(500).json({
      error: "Failed to log workout session",
      details: error.message,
    });
  }
});

// Modify existing /history endpoint to fetch WorkoutPlan history
router.get("/workout-plan/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const history = await WorkoutPlan.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .select("-__v"); // Includes durationWeeks, completed, etc., automatically now

    res.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error("Error fetching workout plan history:", error);
    res.status(500).json({
      error: "Failed to fetch workout plan history",
      details: error.message,
    });
  }
});

// New endpoint to update a workout plan (e.g., set as active/inactive, change name/description)
router.put("/workout-plan/update/:planId", async (req, res) => {
  try {
    const { planId } = req.params;
    const { name, description, isActive } = req.body;

    const workoutPlan = await WorkoutPlan.findById(planId);
    if (!workoutPlan)
      return res.status(404).json({ error: "Workout plan not found" });

    if (isActive !== undefined) {
      if (workoutPlan.completed && isActive) {
        return res.status(400).json({
          error:
            "Completed plans cannot be reactivated. Please create a new plan.",
        });
      }
      // If setting this plan to active, deactivate all other plans for the user
      if (isActive) {
        await WorkoutPlan.updateMany(
          { userId: workoutPlan.userId, isActive: true },
          { isActive: false }
        );
        // Deactivate any existing active diet charts for this user
        await DietChart.updateMany(
          { userId: workoutPlan.userId, isActive: true },
          { isActive: false }
        );
      }
      workoutPlan.isActive = isActive;
    }
    if (name) workoutPlan.name = name;
    if (description) workoutPlan.description = description;

    await workoutPlan.save();

    res.status(200).json({
      success: true,
      message: "Workout plan updated successfully",
      plan: workoutPlan,
    });
  } catch (error) {
    console.error("Error updating workout plan:", error);
    res.status(500).json({
      error: "Failed to update workout plan",
      details: error.message,
    });
  }
});

router.post("/login", login);

// New endpoint to delete a workout plan
router.delete("/workout-plan/delete/:planId", async (req, res) => {
  try {
    const { planId } = req.params;

    const workoutPlan = await WorkoutPlan.findById(planId);
    if (!workoutPlan)
      return res.status(404).json({ error: "Workout plan not found" });

    // Delete associated workout session logs
    await WorkoutSessionLog.deleteMany({ workoutPlanId: planId });

    // Delete associated diet charts
    await DietChart.deleteMany({ workoutPlanId: planId });

    // Remove plan from user's workoutPlans array
    await User.updateOne(
      { _id: workoutPlan.userId },
      { $pull: { workoutPlans: planId } }
    );

    // Delete the workout plan itself
    await workoutPlan.deleteOne();

    res.status(200).json({
      success: true,
      message:
        "Workout plan, associated logs, and diet charts deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting workout plan:", error);
    res.status(500).json({
      error: "Failed to delete workout plan",
      details: error.message,
    });
  }
});

// Chat endpoint for FitBot (update to use structured plan from WorkoutPlan model)
router.post("/chat", async (req, res) => {
  try {
    const { messages, userEmail } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    // Get the last user message
    const lastUserMessage = messages.filter((msg) => msg.role === "user").pop();
    if (!lastUserMessage) {
      return res.status(400).json({ error: "No user message found" });
    }

    // Fetch user's BMI and active workout plan data for personalized advice
    let userContext = "";
    if (userEmail) {
      try {
        const user = await User.findOne({ email: userEmail });
        if (user) {
          // Get latest BMI data
          const latestBMI = await BMI.findOne({ userId: user._id })
            .sort({ date: -1 })
            .lean();

          // Get active workout plan from the new WorkoutPlan model
          const activeWorkoutPlan = await WorkoutPlan.findOne({
            userId: user._id,
            isActive: true,
          })
            .sort({ createdAt: -1 })
            .lean();

          if (latestBMI) {
            userContext += `\n\nUser's Health Profile:\n   645|- BMI: ${latestBMI.bmi
              } (${latestBMI.category})\n   646|- Age: ${latestBMI.age
              }\n   647|- Height: ${latestBMI.heightFeet}'${latestBMI.heightInches
              }"\n   648|- Weight: ${latestBMI.weight
              }kg\n   649|- Target Weight: ${latestBMI.targetWeight || "Not set"
              }kg\n   650|- Target Timeline: ${latestBMI.targetTimeline || "Not set"
              }\n   651|- Diseases: ${user.diseases?.join(", ") || "None"
              }\n   652|- Allergies: ${user.allergies?.join(", ") || "None"}`;
          }

          if (activeWorkoutPlan) {
            userContext += `\n\nUser's Current Active Workout Plan (${activeWorkoutPlan.name
              }):\n   657|- Goal: ${activeWorkoutPlan.generatedParams.fitnessGoal
                ?.replace(/_/g, " ")
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ") || "N/A"
              }\n   658|- Current Weight: ${activeWorkoutPlan.generatedParams.currentWeight || "N/A"
              }kg\n   659|- Target Weight: ${activeWorkoutPlan.generatedParams.targetWeight || "N/A"
              }kg\n   660|- Workout Type: ${activeWorkoutPlan.generatedParams.workoutType || "N/A"
              }\n   661|- Training Method: ${activeWorkoutPlan.generatedParams.trainingMethod || "N/A"
              }\n   662|- Strength Level: ${activeWorkoutPlan.generatedParams.strengthLevel || "N/A"
              }\n   663|- Time Commitment: ${activeWorkoutPlan.generatedParams.timeCommitment || "N/A"
              } min\n   664|- Days Per Week: ${activeWorkoutPlan.generatedParams.daysPerWeek || "N/A"
              }\n   665|- Duration: ${activeWorkoutPlan.generatedParams.durationWeeks || "N/A"
              } weeks\n   666|- Plan Details (first day): ${JSON.stringify(
                activeWorkoutPlan.planContent[0]
              )}...`;
          }
        }
      } catch (contextError) {
        console.error("Error fetching user context:", contextError);
        // Continue without user context if there's an error
      }
    }

    const prompt = `You are FitBot, an AI fitness assistant. Help users with their fitness questions, workout advice, nutrition tips, and motivation. You MUST prioritize the user's provided health profile and current active workout plan details in your responses. Be encouraging, professional, and provide practical advice.\n   376|   234|\n   377|   235|User's question: ${lastUserMessage.content}${userContext}\n   378|   236|\n   379|   237|Please provide a helpful response as a fitness coach would, taking into account the user's health profile and current workout plan when relevant.`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topP: 0.8,
          topK: 10,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    let botResponse =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't process your request right now. Please try again.";

    // Clean up the response by removing excessive asterisks and formatting
    botResponse = botResponse
      .replace(/\*{2,}/g, "") // Remove multiple asterisks (**, ***, etc.)
      .replace(/\*([^*]+)\*/g, "$1") // Remove single asterisks around text
      .replace(/\*{1,2}\s*/g, "") // Remove remaining asterisks at start of lines
      .replace(/\n\s*\*\s*/g, "\n• ") // Convert remaining asterisks to bullet points
      .replace(/\n{3,}/g, "\n\n") // Remove excessive line breaks
      .replace(/^\s*\*\s*/gm, "• ") // Convert line-starting asterisks to bullets
      .trim();

    res.json({
      success: true,
      response: botResponse,
    });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    if (error.response) {
      console.error("Gemini API response error:", error.response.data);
    }
    res.status(500).json({
      error: "Failed to process chat message",
      details: error.message,
    });
  }
});

// Image-based calorie tracking using Gemini Vision
router.post("/calorie-tracker/scan", async (req, res) => {
  try {
    const { imageBase64, userNote } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: "imageBase64 is required in the request body",
      });
    }

    // Strip data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

    const prompt = `
You are a nutrition assistant. A user has uploaded a food image.

TASK:
- Detect the main food items and estimate calories as realistically as you can.
- You MUST work well for **Indian foods** (South Indian, North Indian, street food, thalis, curries, biryanis, dosas, parathas, sabzis, sweets, etc.), as well as any international food.
- If multiple foods are present (e.g., rice + curry + salad), list them separately and also give a total.

VERY IMPORTANT OUTPUT RULES:
- Return ONLY valid JSON (no markdown, no code fences, no comments, no trailing commas).
- Do NOT break strings across lines. Every string value must be on a single line.
- Food "name" must be a short label without quotes inside it. Examples:
  - "Masala Dosa"
  - "Stuffed Paratha"
  - "Dal Makhani"
  - "Paneer Butter Masala"
  - "Idli Sambar"
  - "Rajma Chawal"
- Use plain ASCII characters in the JSON output.
- If you are unsure of the exact dish, choose the **closest reasonable Indian dish name** and give a best calorie estimate.

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "food_items": [
    {
      "name": "Masala Dosa",
      "estimated_calories": 350,
      "confidence": 0.82
    }
  ],
  "total_estimated_calories": 350,
  "notes": "short human readable note about assumptions/portion size"
}

${userNote ? `User note / context: ${userNote}` : ""}
`.trim();

    // Use the same Gemini model as the rest of the app (from config)
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 512,
          topP: 0.8,
          topK: 20,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 25000,
      }
    );

    let raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    raw = raw.trim();

    // Strip accidental code fences if Gemini adds them
    if (raw.startsWith("```")) {
      raw = raw.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse Gemini calorie JSON:", e.message);
      console.error("Raw response:", raw);

      // Fallback: try to salvage something from the text response
      try {
        const items = [];

        const nameMatches = [...raw.matchAll(/"name"\s*:\s*"([^"\n]+)/g)];
        const calMatches = [...raw.matchAll(
          /"estimated_calories"\s*:\s*([0-9]+(?:\.[0-9]+)?)/g
        )];

        const maxLen = Math.max(nameMatches.length, calMatches.length);
        for (let i = 0; i < maxLen; i++) {
          const name = nameMatches[i]?.[1]?.trim() || `Food ${i + 1}`;
          const calories = calMatches[i]
            ? Number(calMatches[i][1])
            : 0;
          items.push({
            name,
            estimated_calories: calories,
            confidence: null,
          });
        }

        const total = items.reduce(
          (acc, it) => acc + (Number(it.estimated_calories) || 0),
          0
        );

        parsed = {
          food_items: items,
          total_estimated_calories: total,
          notes:
            "Parsed in fallback mode because the AI response was not valid JSON. Values are approximate.",
        };
      } catch (fallbackErr) {
        console.error(
          "Fallback parse for Gemini calorie response also failed:",
          fallbackErr.message
        );
        // Final ultra-safe fallback: return empty, not an error
        parsed = {
          food_items: [],
          total_estimated_calories: 0,
          notes:
            "Could not parse AI response reliably. Please try again with a clearer photo or different lighting.",
        };
      }
    }

    return res.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error("Error in calorie-tracker/scan endpoint:", error);
    if (error.response) {
      console.error("Gemini API response error:", error.response.data);
    }
    return res.status(500).json({
      success: false,
      error: "Failed to analyze food image",
      details: error.message,
    });
  }
});

// New endpoint to generate a diet chart
router.post("/generate-diet-chart", async (req, res) => {
  try {
    const {
      userId,
      durationWeeks,
      fitnessGoal,
      currentWeight,
      targetWeight,
      diseases,
      allergies,
      activeWorkoutPlan,
    } = req.body;

    console.log("🤖 [DIET CHART GENERATE] Request received:", {
      userId,
      durationWeeks,
      fitnessGoal,
      currentWeight,
      targetWeight,
      hasActiveWorkoutPlan: !!activeWorkoutPlan,
      activeWorkoutPlanId: activeWorkoutPlan?._id,
    });

    if (!userId || !durationWeeks || !fitnessGoal || !currentWeight) {
      console.log("❌ [DIET CHART GENERATE] Missing required fields:", {
        hasUserId: !!userId,
        hasDurationWeeks: !!durationWeeks,
        hasFitnessGoal: !!fitnessGoal,
        hasCurrentWeight: !!currentWeight,
      });
      return res
        .status(400)
        .json({ error: "Missing required fields for diet chart generation" });
    }

    console.log("🔍 [DIET CHART GENERATE] Finding user...");
    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ [DIET CHART GENERATE] User not found:", userId);
      return res.status(404).json({ error: "User not found" });
    }
    console.log("✅ [DIET CHART GENERATE] User found:", user.email);

    console.log("🔍 [DIET CHART GENERATE] Finding latest BMI...");
    const latestBMI = await BMI.findOne({ userId }).sort({ date: -1 });
    console.log(
      "🔍 [DIET CHART GENERATE] Latest BMI:",
      latestBMI ? "Found" : "Not found"
    );

    let dietChartPrompt = `Generate a ${durationWeeks}-week diet chart for a user with the following details:
    - Fitness Goal: ${fitnessGoal}
    - Current Weight: ${currentWeight}kg
    - Target Weight: ${targetWeight || "Not specified"}kg
    - Diseases: ${diseases?.join(", ") || "None"}
    - Allergies: ${allergies?.join(", ") || "None"}
    `;

    if (latestBMI) {
      dietChartPrompt += `\n- BMI: ${latestBMI.bmi} (${latestBMI.category})\n- Age: ${latestBMI.age}\n- Height: ${latestBMI.heightFeet}'${latestBMI.heightInches}"`;
    }

    if (activeWorkoutPlan) {
      dietChartPrompt += `\n\nUser's Current Active Workout Plan (ID: ${activeWorkoutPlan._id
        }):\n- Name: ${activeWorkoutPlan.name}\n- Goal: ${activeWorkoutPlan.generatedParams.fitnessGoal
          ?.replace(/_/g, " ")
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ") || "N/A"
        }\n- Days Per Week: ${activeWorkoutPlan.generatedParams.daysPerWeek || "N/A"
        }\n- Workout Type: ${activeWorkoutPlan.generatedParams.workoutType || "N/A"
        }\n- Intensity: ${activeWorkoutPlan.generatedParams.intensity || "N/A"
        }\n- Time Commitment: ${activeWorkoutPlan.generatedParams.timeCommitment || "N/A"
        } minutes\n- Current Week: ${activeWorkoutPlan.currentWeek || "N/A"} of ${activeWorkoutPlan.durationWeeks || "N/A"
        } weeks`;
    }

    dietChartPrompt += `\n\nProvide a detailed meal plan for each day of the week, including breakfast, lunch, dinner, and snacks. Specify portion sizes and calorie estimates. Ensure the plan is healthy, balanced, and considers the user's health conditions, fitness goal, and active workout plan. The diet chart should be suitable for the entire ${durationWeeks}-week duration, with general guidelines for variation week-to-week.`;

    console.log("🤖 [DIET CHART GENERATE] Calling Gemini API...");
    console.log(
      "🤖 [DIET CHART GENERATE] Prompt length:",
      dietChartPrompt.length
    );

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: dietChartPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 8000,
          topP: 0.9,
          topK: 20,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 25000,
      }
    );

    console.log("🤖 [DIET CHART GENERATE] Gemini API response received");
    console.log("🤖 [DIET CHART GENERATE] Response status:", response.status);

    let dietChartContent =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Failed to generate diet chart.";

    console.log(
      "🤖 [DIET CHART GENERATE] Generated content length:",
      dietChartContent.length
    );
    console.log(
      "🤖 [DIET CHART GENERATE] Content preview:",
      dietChartContent.substring(0, 200) + "..."
    );

    // Optional: Parse and structure the diet chart if a specific JSON format is desired from Gemini
    // For now, sending as plain text/markdown string.

    console.log("✅ [DIET CHART GENERATE] Sending response to frontend");
    res.status(200).json({
      success: true,
      dietChart: {
        dietChart: dietChartContent,
      },
    });
  } catch (error) {
    console.error("Error generating diet chart:", error);
    if (error.response) {
      console.error("Gemini API response error:", error.response.data);
    }
    res.status(500).json({
      error: "Failed to generate diet chart",
      details: error.message,
    });
  }
});

// Save diet chart
router.post("/diet-chart/save", async (req, res) => {
  try {
    const { userId, workoutPlanId, dietChart, durationWeeks } = req.body;
    console.log("💾 [DIET CHART SAVE] Request received:", {
      userId,
      workoutPlanId,
      hasDietChart: !!dietChart,
      dietChartLength: dietChart?.length || 0,
      durationWeeks,
    });

    if (!userId || !workoutPlanId || !dietChart) {
      console.log("❌ [DIET CHART SAVE] Missing required fields:", {
        hasUserId: !!userId,
        hasWorkoutPlanId: !!workoutPlanId,
        hasDietChart: !!dietChart,
      });
      return res.status(400).json({
        error: "Missing required fields: userId, workoutPlanId, and dietChart",
      });
    }

    console.log("🔄 [DIET CHART SAVE] Deactivating existing diet charts...");
    // Deactivate any existing diet charts for this workout plan
    const deactivateResult = await DietChart.updateMany(
      { userId: userId, workoutPlanId: workoutPlanId },
      { isActive: false }
    );
    console.log(
      "🔄 [DIET CHART SAVE] Deactivated existing charts:",
      deactivateResult.modifiedCount
    );

    console.log("💾 [DIET CHART SAVE] Creating new diet chart...");
    const newDietChart = new DietChart({
      userId,
      workoutPlanId,
      dietChart,
      durationWeeks,
      isActive: true,
    });

    console.log("💾 [DIET CHART SAVE] Saving to database...");
    const savedDietChart = await newDietChart.save();
    console.log("✅ [DIET CHART SAVE] Successfully saved:", {
      id: savedDietChart._id,
      userId: savedDietChart.userId,
      workoutPlanId: savedDietChart.workoutPlanId,
      isActive: savedDietChart.isActive,
      contentLength: savedDietChart.dietChart?.length || 0,
    });

    // Award points for generating diet chart
    try {
      const { awardPoints } = require("../utils/gamify");
      await awardPoints(userId, "diet_chart");
    } catch (e) {
      console.error("Gamify award error:", e);
    }

    res.status(201).json({
      success: true,
      message: "Diet chart saved successfully",
      dietChart: savedDietChart,
    });
  } catch (error) {
    console.error("❌ [DIET CHART SAVE] Error saving diet chart:", error);
    res.status(500).json({
      error: "Failed to save diet chart",
      details: error.message,
    });
  }
});

// Get diet chart for a specific workout plan
router.get("/diet-chart/:userId/:workoutPlanId", async (req, res) => {
  try {
    const { userId, workoutPlanId } = req.params;
    console.log("🔍 [DIET CHART GET] Request received:", {
      userId,
      workoutPlanId,
    });

    const dietChart = await DietChart.findOne({
      userId: userId,
      workoutPlanId: workoutPlanId,
      isActive: true,
    });

    console.log(
      "🔍 [DIET CHART GET] Database query result:",
      dietChart ? "Found" : "Not found"
    );

    if (!dietChart) {
      console.log("❌ [DIET CHART GET] No active diet chart found");
      return res.status(404).json({
        error: "No active diet chart found for this workout plan",
      });
    }

    console.log("✅ [DIET CHART GET] Returning diet chart:", {
      id: dietChart._id,
      hasContent: !!dietChart.dietChart,
      contentLength: dietChart.dietChart?.length || 0,
    });

    res.status(200).json({
      success: true,
      dietChart: dietChart,
    });
  } catch (error) {
    console.error("❌ [DIET CHART GET] Error fetching diet chart:", error);
    res.status(500).json({
      error: "Failed to fetch diet chart",
      details: error.message,
    });
  }
});

// Get all diet charts for a user
router.get("/diet-charts/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const dietCharts = await DietChart.find({ userId: userId })
      .populate("workoutPlanId", "name description")
      .sort({ generatedAt: -1 });

    res.status(200).json({
      success: true,
      dietCharts: dietCharts,
    });
  } catch (error) {
    console.error("Error fetching diet charts:", error);
    res.status(500).json({
      error: "Failed to fetch diet charts",
      details: error.message,
    });
  }
});

// Delete diet chart
router.delete("/diet-chart/:dietChartId", async (req, res) => {
  try {
    const { dietChartId } = req.params;

    const dietChart = await DietChart.findById(dietChartId);
    if (!dietChart) {
      return res.status(404).json({
        error: "Diet chart not found",
      });
    }

    await DietChart.findByIdAndDelete(dietChartId);

    res.status(200).json({
      success: true,
      message: "Diet chart deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting diet chart:", error);
    res.status(500).json({
      error: "Failed to delete diet chart",
      details: error.message,
    });
  }
});

// -----------------------------
// Google Fit integration (steps)
// -----------------------------

// Start OAuth flow for Google Fit (links Fit account to a userId)
router.get("/google-fit/link", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Validate environment variables
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    
    if (!clientId) {
      console.error('❌ [Google Fit] GOOGLE_CLIENT_ID is missing or empty');
      return res.status(500).json({ 
        error: "Google OAuth configuration error: Client ID is missing",
        hint: "Check your .env file - ensure GOOGLE_CLIENT_ID has no spaces around the = sign"
      });
    }
    
    if (!clientSecret) {
      console.error('❌ [Google Fit] GOOGLE_CLIENT_SECRET is missing or empty');
      return res.status(500).json({ 
        error: "Google OAuth configuration error: Client Secret is missing",
        hint: "Check your .env file - ensure GOOGLE_CLIENT_SECRET has no spaces around the = sign"
      });
    }

    const redirectUri = getGoogleFitRedirectUri(req);
    console.log('🔗 [Google Fit] Starting OAuth flow');
    console.log('🔗 [Google Fit] Redirect URI:', redirectUri);
    console.log('🔗 [Google Fit] Client ID:', clientId.substring(0, 20) + '...');
    console.log('🔗 [Google Fit] Client Secret:', clientSecret.substring(0, 10) + '...');
    
    const oauth2Client = new OAuth2Client(
      clientId,
      clientSecret,
      redirectUri
    );

    const scopes = ["https://www.googleapis.com/auth/fitness.activity.read"];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: scopes,
      state: String(userId),
      include_granted_scopes: true,
    });

    console.log('🔗 [Google Fit] Generated auth URL (first 100 chars):', authUrl.substring(0, 100) + '...');
    return res.redirect(authUrl);
  } catch (e) {
    console.error("❌ [Google Fit] Link error:", e);
    return res.status(500).json({ error: "Failed to start Google Fit linking", details: e.message });
  }
});

// OAuth callback: exchanges code for tokens and stores refresh token
router.get("/google-fit/callback", async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.error("Google Fit OAuth error:", error);
      return res.redirect(
        `${getFrontendRedirectBase()}/home?googleFit=error`
      );
    }
    if (!code || !state) {
      return res.status(400).send("Missing code/state");
    }

    const userId = String(state);
    const user = await User.findById(userId).select("+googleFit.refreshToken");
    if (!user) return res.status(404).send("User not found");

    const redirectUri = getGoogleFitRedirectUri(req);
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const tokenResponse = await oauth2Client.getToken(String(code));
    const tokens = tokenResponse.tokens || {};

    if (!tokens.refresh_token && !user.googleFit?.refreshToken) {
      console.warn(
        "Google Fit: missing refresh_token (user may have previously consented)"
      );
    }

    user.googleFitLinked = true;
    user.googleFit = user.googleFit || {};
    if (tokens.refresh_token) user.googleFit.refreshToken = tokens.refresh_token;

    await user.save();

    return res.redirect(
      `${getFrontendRedirectBase()}/home?googleFit=linked`
    );
  } catch (e) {
    console.error("Google Fit callback error:", e);
    return res.redirect(`${getFrontendRedirectBase()}/home?googleFit=error`);
  }
});

// Simple status endpoint for UI
router.get("/google-fit/status", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.status(200).json({
      linked: !!user.googleFitLinked,
      lastSyncedSteps: user.googleFit?.lastSyncedSteps || 0,
      lastSyncAt: user.googleFit?.lastSyncAt || null,
    });
  } catch (e) {
    console.error("Google Fit status error:", e);
    return res.status(500).json({ error: "Failed to fetch Google Fit status" });
  }
});

// Fetch today's steps from Google Fit (requires linked account)
router.get("/google-fit/steps/today", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const user = await User.findById(userId).select("+googleFit.refreshToken");
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.googleFitLinked || !user.googleFit?.refreshToken) {
      return res.status(400).json({
        error:
          "Google Fit not linked (or missing refresh token). Please link again.",
      });
    }

    const redirectUri = getGoogleFitRedirectUri(req);
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );
    oauth2Client.setCredentials({ refresh_token: user.googleFit.refreshToken });

    const accessTokenResponse = await oauth2Client.getAccessToken();
    const accessToken = accessTokenResponse?.token;
    if (!accessToken) {
      return res.status(500).json({ error: "Failed to get Google access token" });
    }

    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const startTimeMillis = start.getTime();
    const endTimeMillis = now.getTime();

    const fitResponse = await axios.post(
      "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
      {
        aggregateBy: [{ dataTypeName: "com.google.step_count.delta" }],
        bucketByTime: { durationMillis: 24 * 60 * 60 * 1000 },
        startTimeMillis,
        endTimeMillis,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    const buckets = fitResponse.data?.bucket || [];
    let totalSteps = 0;
    for (const bucket of buckets) {
      const datasets = bucket?.dataset || [];
      for (const ds of datasets) {
        const points = ds?.point || [];
        for (const p of points) {
          const val = p?.value?.[0];
          const stepsVal =
            typeof val?.intVal === "number"
              ? val.intVal
              : typeof val?.fpVal === "number"
              ? Math.round(val.fpVal)
              : 0;
          totalSteps += stepsVal;
        }
      }
    }

    user.googleFit = user.googleFit || {};
    user.googleFit.lastSyncedSteps = totalSteps;
    user.googleFit.lastSyncAt = new Date();
    await user.save();

    return res.status(200).json({
      steps: totalSteps,
      date: start.toISOString().slice(0, 10),
      source: "google_fit",
    });
  } catch (e) {
    console.error("Google Fit steps error:", e?.response?.data || e);
    return res.status(500).json({
      error: "Failed to fetch steps from Google Fit",
      details: e?.response?.data || e?.message,
    });
  }
});

module.exports = router;
