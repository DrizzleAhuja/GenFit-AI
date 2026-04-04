const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const MaintenanceRun = require("../models/MaintenanceRun");
const WorkoutPlan = require("../models/WorkoutPlan").default || require("../models/WorkoutPlan");
const DietChart = require("../models/DietChart");
const { getIo, getUserSocket } = require("../utils/socket");

function todayKey() {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isRestDayForPlan(plan) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let scheduleToday = null;
  if (plan.scheduledDates && plan.scheduledDates.length > 0) {
    scheduleToday = plan.scheduledDates.find(
      (entry) => new Date(entry.date).setHours(0, 0, 0, 0) === today.getTime()
    );
  }
  if (scheduleToday && plan.planContent) {
    const dayPlan = plan.planContent[scheduleToday.dayIndex];
    if (
      !dayPlan ||
      !dayPlan.exercises ||
      dayPlan.exercises.length === 0 ||
      (dayPlan.focus && dayPlan.focus.toLowerCase().includes("rest"))
    ) {
      return true;
    }
    return false;
  }
  return true;
}

/**
 * Runs at most once per calendar day (server-local date key) across all instances.
 * One notification per user with an active workout plan and/or diet chart.
 */
async function runDailyFitnessRemindersIfDue() {
  const key = `daily_fitness_reminder_${todayKey()}`;
  try {
    await MaintenanceRun.create({ key });
  } catch (e) {
    if (e && e.code === 11000) {
      return { ran: false, reason: "already_ran_today" };
    }
    throw e;
  }

  const planUserIds = await WorkoutPlan.find({ isActive: true }).distinct("userId");
  const dietUserIds = await DietChart.find({ isActive: true }).distinct("userId");
  const idSet = new Set([...planUserIds.map(String), ...dietUserIds.map(String)]);

  let created = 0;
  for (const idStr of idSet) {
    let userId;
    try {
      userId = new mongoose.Types.ObjectId(idStr);
    } catch {
      continue;
    }

    const plan = await WorkoutPlan.findOne({ userId, isActive: true }).lean();
    const diet = await DietChart.findOne({ userId, isActive: true }).lean();
    if (!plan && !diet) continue;

    const messages = [];
    let type = "system";

    if (plan) {
      const rest = isRestDayForPlan(plan);
      if (rest) {
        messages.push("You have a rest day planned! Take time to recover and hydrate.");
      } else {
        messages.push("You have a workout planned for today! Open My Workout Plan for today's session.");
        type = "workout";
      }
    }
    if (diet) {
      messages.push("Your diet chart is active—review today's meals and macros in Diet Chart.");
    }

    const notification = await Notification.create({
      userId,
      title: "Daily fitness reminder",
      message: messages.join(" "),
      type,
    });
    created += 1;

    try {
      const socketId = getUserSocket(userId);
      if (socketId) {
        getIo().to(socketId).emit("newNotification", notification);
      }
    } catch (_) {
      /* offline */
    }
  }

  return { ran: true, notificationsCreated: created };
}

module.exports = { runDailyFitnessRemindersIfDue, todayKey };
