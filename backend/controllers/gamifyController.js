const User = require("../models/User");

exports.getStats = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: "Email is required" });
        const user = await User.findOne({ email }).lean();
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({
            points: user.points || 0,
            weeklyPoints: user.weeklyPoints || 0,
            streakCount: user.streakCount || 0,
            lastActivityAt: user.lastActivityAt,
            sportsPreferences: user.sportsPreferences || {},
            badges: user.badges || [],
            weeklyChallenge: user.weeklyChallenge || {},
        });
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const { period = "week" } = req.query;
        const projection = { firstName: 1, lastName: 1, email: 1, points: 1, weeklyPoints: 1 };
        let users;
        if (period === "all") {
            users = await User.find({}, projection).sort({ points: -1 }).limit(50).lean();
        } else {
            users = await User.find({}, projection).sort({ weeklyPoints: -1 }).limit(50).lean();
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
    try {
        const { email, preferredSports = [], sportLevel = "beginner", sportGoals = [] } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });
        const user = await User.findOneAndUpdate(
            { email },
            {
                $set: {
                    sportsPreferences: { preferredSports, sportLevel, sportGoals },
                },
            },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ message: "Preferences updated", sportsPreferences: user.sportsPreferences });
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
};


