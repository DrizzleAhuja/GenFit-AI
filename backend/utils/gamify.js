const User = require("../models/User");

function isSameDay(d1, d2) {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}

function isYesterday(d1, d2) {
    const y = new Date(d2);
    y.setDate(y.getDate() - 1);
    return isSameDay(d1, y);
}

function startOfWeek(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    const s = new Date(date.setDate(diff));
    s.setHours(0, 0, 0, 0);
    return s;
}

const POINT_MAP = {
    bmi_save: 10,           // BMI save/update: 10 points
    bmi_update: 10,         // BMI update: 10 points
    workout_generate: 20,   // Workout plan generated: 20 points
    workout_log: 20,        // Workout plan completed (one day): 20 points
    diet_chart: 20,         // Diet chart generated: 20 points
    streak_bonus: 5,        // Daily streak bonus: 5 points
};

async function awardPoints(userId, type) {
    const user = await User.findById(userId);
    if (!user) return null;

    const now = new Date();
    // Weekly reset
    const currentWeekStart = startOfWeek(now);
    if (!user.weeklyStartAt || startOfWeek(user.weeklyStartAt).getTime() !== currentWeekStart.getTime()) {
        user.weeklyStartAt = currentWeekStart;
        user.weeklyPoints = 0;
        // reset weekly challenge
        if (user.weeklyChallenge) {
            user.weeklyChallenge.weekStartAt = currentWeekStart;
            user.weeklyChallenge.progress = 0;
            user.weeklyChallenge.completed = false;
        }
    }

    // Streak logic
    if (!user.lastActivityAt) {
        user.streakCount = 1;
    } else if (isSameDay(user.lastActivityAt, now)) {
        // same day: keep streak as is
    } else if (isYesterday(user.lastActivityAt, now)) {
        user.streakCount += 1;
        user.points += POINT_MAP.streak_bonus;
        user.weeklyPoints += POINT_MAP.streak_bonus;
    } else {
        user.streakCount = 1;
    }

    // Base points
    const add = POINT_MAP[type] || 0;
    user.points += add;
    user.weeklyPoints += add;
    user.lastActivityAt = now;

    // Weekly challenge progress (count workout logs)
    if (type === 'workout_log') {
        if (user.weeklyChallenge) {
            user.weeklyChallenge.progress = (user.weeklyChallenge.progress || 0) + 1;
            const target = user.weeklyChallenge.target || 3;
            if (!user.weeklyChallenge.completed && user.weeklyChallenge.progress >= target) {
                user.weeklyChallenge.completed = true;
                // bonus and badge
                user.points += 30;
                user.weeklyPoints += 30;
                if (!Array.isArray(user.badges)) user.badges = [];
                if (!user.badges.includes('Weekly Challenger')) user.badges.push('Weekly Challenger');
            }
        }
    }

    // Badge unlocks based on streak and points
    if (!Array.isArray(user.badges)) user.badges = [];
    if (user.streakCount >= 3 && !user.badges.includes('3-Day Streak')) user.badges.push('3-Day Streak');
    if (user.streakCount >= 7 && !user.badges.includes('7-Day Streak')) user.badges.push('7-Day Streak');
    if (user.streakCount >= 14 && !user.badges.includes('14-Day Streak')) user.badges.push('14-Day Streak');
    if (user.streakCount >= 30 && !user.badges.includes('30-Day Streak')) user.badges.push('30-Day Streak');
    if (user.points >= 1000 && !user.badges.includes('1K Points')) user.badges.push('1K Points');
    if (user.points >= 5000 && !user.badges.includes('5K Points')) user.badges.push('5K Points');

    await user.save();
    return { points: user.points, weeklyPoints: user.weeklyPoints, streakCount: user.streakCount };
}

module.exports = { awardPoints };


