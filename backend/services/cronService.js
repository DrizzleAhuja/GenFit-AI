const cron = require("node-cron");
const { runDailyFitnessRemindersIfDue } = require("./dailyFitnessReminders");

const startCronJobs = () => {
  cron.schedule("0 8 * * *", async () => {
    try {
      console.log("Running daily 8 AM fitness reminder cron job...");
      const result = await runDailyFitnessRemindersIfDue();
      console.log("Cron daily reminders:", result);
    } catch (error) {
      console.error("Cron Job Error:", error);
    }
  });
};

module.exports = { startCronJobs };
