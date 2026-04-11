const User = require("../models/User");
const axios = require("axios");
const { GEMINI_API_KEY, GEMINI_API_URL } = require("../config/config");
const { expireEndedWeeklyChallenges } = require("../utils/weeklyChallengeExpiry");
const WorkoutSessionLog = require("../models/WorkoutSessionLog").default;
const CalorieIntakeLog = require("../models/CalorieIntakeLog").default;
const PostureSessionLog = require("../models/PostureSessionLog").default;
const Notification = require("../models/Notification");

exports.getStats = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: "Email is required" });
        await expireEndedWeeklyChallenges();
        const user = await User.findOne({ email }).lean();
        if (!user) return res.status(404).json({ error: "User not found" });
        const wc =
            user.weeklyChallenge && user.weeklyChallenge.title ? user.weeklyChallenge : null;
        res.json({
            points: user.points || 0,
            weeklyPoints: user.weeklyPoints || 0,
            streakCount: user.streakCount || 0,
            lastActivityAt: user.lastActivityAt,
            sportsPreferences: user.sportsPreferences || {},
            badges: user.badges || [],
            weeklyChallenge: wc,
        });
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const { period = "week" } = req.query;
        const projection = { firstName: 1, lastName: 1, email: 1, points: 1, weeklyPoints: 1, streakCount: 1, avatar: 1 };
        let users;
        if (period === "all") {
            users = await User.find({}, projection).sort({ points: -1 }).lean();
        } else {
            users = await User.find({}, projection).sort({ weeklyPoints: -1 }).lean();
        }
        res.json({ period, users });
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.getAdherence = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: "userId is required" });
        // Compute adherence from WorkoutPlan model: completedDayCount / total planned days
        const WorkoutPlan = require("../models/WorkoutPlan").default;
        const plan = await WorkoutPlan.findOne({ userId, isActive: true }).lean();
        if (!plan) return res.json({ active: false, adherenceThisWeek: 0, last4Weeks: [] });

        const daysPerWeek = plan.generatedParams?.daysPerWeek || plan.planContent?.length || 0;
        const totalWeeks = plan.durationWeeks || 1;
        const completions = plan.dayCompletions || [];

        const now = new Date();
        const startWeek = Math.max(1, (plan.currentWeek || 1) - 3);
        const last4Weeks = [];
        for (let w = startWeek; w <= (plan.currentWeek || 1); w++) {
            const done = completions.filter(dc => dc.weekNumber === w).length;
            const pct = daysPerWeek ? Math.round((done / daysPerWeek) * 100) : 0;
            last4Weeks.push({ week: w, percent: pct });
        }
        const thisWeekDone = completions.filter(dc => dc.weekNumber === (plan.currentWeek || 1)).length;
        const adherenceThisWeek = daysPerWeek ? Math.round((thisWeekDone / daysPerWeek) * 100) : 0;

        res.json({ active: true, adherenceThisWeek, last4Weeks });
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.updatePreferences = async (req, res) => {
    // ... (existing updatePreferences code)
};

// --- Weekly AI Report Logic ---

exports.generateWeeklyReport = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: "userId is required" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        startOfWeek.setHours(0,0,0,0);

        const result = await _executeReportGeneration(userId, startOfWeek, user);
        if (result.alreadyExists) {
            return res.json({ message: "Report already generated for this week", report: result.report });
        }

        res.status(201).json({ success: true, report: result.report });
    } catch (error) {
        console.error("Weekly Report Error:", error);
        res.status(500).json({ error: "Failed to generate report", details: error.message });
    }
};

/**
 * Background trigger for Sunday auto-generation
 */
exports.checkAndAutoGenerateReport = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: "userId is required" });

        // 1. Is it Sunday?
        if (new Date().getDay() !== 0) {
            return res.json({ skip: true, reason: "Not Sunday" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        startOfWeek.setHours(0,0,0,0);

        const result = await _executeReportGeneration(userId, startOfWeek, user);
        res.json({ success: true, autoGenerated: !result.alreadyExists, report: result.report });
    } catch (error) {
        console.error("Auto Report Error:", error);
        res.status(500).json({ error: "Auto-generation check failed" });
    }
};

/**
 * Shared Helper: Executes the AI generation logic
 */
async function _executeReportGeneration(userId, startOfWeek, user) {
    try {
        const existingReport = user.weeklyReports.find(r => 
            new Date(r.weekStarting).toDateString() === startOfWeek.toDateString()
        );
    
    if (existingReport) {
        return { alreadyExists: true, report: existingReport };
    }

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

        // 1. Gather Data
        const workouts = await WorkoutSessionLog.find({
            userId,
            date: { $gte: startOfWeek, $lt: endOfWeek }
        });

        const calories = await CalorieIntakeLog.find({
            userId,
            date: { $gte: startOfWeek, $lt: endOfWeek }
        });

        const posture = await PostureSessionLog.find({
            userId,
            date: { $gte: startOfWeek, $lt: endOfWeek }
        });

        // 2. Compute Metrics
        const totalWorkouts = workouts.length;
        let totalSets = 0;
        let totalReps = 0;
        workouts.forEach(w => {
            w.workoutDetails.forEach(ex => {
                totalSets += ex.sets || 0;
                // reps is often a string like "10, 10, 10" or "10"
                if (typeof ex.reps === 'string') {
                    const rArr = ex.reps.split(',').map(r => parseInt(r.trim())).filter(r => !isNaN(r));
                    totalReps += rArr.reduce((a, b) => a + b, 0);
                } else {
                    totalReps += parseInt(ex.reps) || 0;
                }
            });
        });

        const totalCalBurned = workouts.reduce((acc, w) => acc + (w.calories || 0), 0) + posture.reduce((acc, p) => acc + (p.calories || 0), 0);
        const totalCalIntake = calories.reduce((acc, c) => acc + (c.totalCalories || 0), 0);
        const avgCalIntake = calories.length ? Math.round(totalCalIntake / calories.length) : 0;
        
        // Compute Daily Activity for Graph
        const dailyActivity = [0, 0, 0, 0, 0, 0, 0];
        workouts.forEach(w => {
            const dayOfLog = new Date(w.date);
            const diffTime = Math.abs(dayOfLog - startOfWeek);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays < 7) {
                dailyActivity[diffDays]++;
            }
        });
        
        // 3. AI Generation
        const reportPrompt = `
            Analyze user health data for the week (${startOfWeek.toDateString()}).
            Generate a professional, motivating Fitness Report Card.

            STRICT RULES:
            1. NO HASHTAGS (#) at all.
            2. Use BOLD for titles (e.g., **DAILY INSIGHTS**).
            3. Use bullet points (-) for lists.
            4. Do not mention "Markdown" or "Metadata".

            USER STATS:
            - Workouts: ${totalWorkouts} sessions
            - Activity: ${totalSets} sets, ${totalReps} total reps
            - Nutrition: Avg ${avgCalIntake} kcal/day
            - Active Burn: ${totalCalBurned} kcal
            - Streak: ${user.streakCount} days
            
            STRUCTURE:
            - **WEEKLY EXECUTIVE SUMMARY**
            - **CONSISTENCY & VOLUME ANALYSIS**
            - **NUTRITION INSIGHTS**
            - **BATTLE GOALS FOR NEXT WEEK** (provide 3 specific ones)
        `;

        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: reportPrompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1500,
                    topP: 0.8,
                    topK: 10,
                },
            },
            {
                headers: { "Content-Type": "application/json" },
                timeout: 30000,
            }
        );

        const reportText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Report content currently unavailable.";

        // 4. Save and Notify
        const newReport = {
            weekStarting: startOfWeek,
            markdownContent: reportText,
            metrics: {
                totalCalories: totalCalIntake,
                avgCalories: avgCalIntake,
                totalWorkouts: totalWorkouts,
                totalSets: totalSets,
                totalReps: totalReps,
                dailyActivity: dailyActivity
            }
        };

        user.weeklyReports.push(newReport);
        await user.save();

        // Create notification
        await Notification.create({
            userId,
            title: "🏆 Your AI Weekly Report is Ready!",
            message: "Analyze your performance and see your new goals for next week in your health dashboard.",
            type: "success"
        });

        return { alreadyExists: false, report: newReport };
    } catch (error) {
        throw error;
    }
}

exports.getLatestWeeklyReport = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: "userId is required" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (!user.weeklyReports || user.weeklyReports.length === 0) {
            return res.json({ report: null });
        }

        // Return the most recent one
        const latest = user.weeklyReports[user.weeklyReports.length - 1];
        res.json({ report: latest });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};


