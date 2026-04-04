const { expireEndedWeeklyChallenges } = require("../utils/weeklyChallengeExpiry");
const { runDailyFitnessRemindersIfDue } = require("../services/dailyFitnessReminders");

exports.postDailyTick = async (req, res) => {
  try {
    const expired = await expireEndedWeeklyChallenges();
    const reminders = await runDailyFitnessRemindersIfDue();
    res.json({
      success: true,
      expiredWeeklyChallenges: expired,
      dailyReminders: reminders,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
