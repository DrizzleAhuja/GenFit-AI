const cron = require("node-cron");
const Notification = require("../models/Notification");
const WorkoutPlan = require("../models/WorkoutPlan").default || require("../models/WorkoutPlan");
const DietChart = require("../models/DietChart");
// We can use the imported getIo and getUserSocket wrapper if we need realtime delivery here
// but typically cron runs in the background. If a user is online at 8 AM, we deliver it live.
const { getIo, getUserSocket } = require("../utils/socket");

const startCronJobs = () => {
    // Run every day at 8:00 AM (server time zone)
    cron.schedule("0 8 * * *", async () => {
        try {
            console.log("Running daily 8 AM fitness reminder cron job...");
            
            // Find active workout plans
            const activeWorkouts = await WorkoutPlan.find({ isActive: true });
            
            for (const plan of activeWorkouts) {
                let isRestDay = false;
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                let scheduleToday = null;
                if (plan.scheduledDates && plan.scheduledDates.length > 0) {
                    scheduleToday = plan.scheduledDates.find(
                        (d) => new Date(d.date).setHours(0, 0, 0, 0) === today.getTime()
                    );
                }

                if (scheduleToday && plan.planContent) {
                    const dayPlan = plan.planContent[scheduleToday.dayIndex];
                    if (!dayPlan || !dayPlan.exercises || dayPlan.exercises.length === 0 || 
                        (dayPlan.focus && dayPlan.focus.toLowerCase().includes("rest"))) {
                        isRestDay = true;
                    }
                } else {
                    // No schedule today could technically mean it's an off day or generation error, default to rest day.
                    isRestDay = true;
                }

                const title = "Daily Fitness Reminder";
                const message = isRestDay 
                    ? "You have a rest day planned! Take time to recover and hydrate." 
                    : "You have a workout & diet planned for today! Let's get it.";
                const type = isRestDay ? "system" : "workout";

                // Create the persistent notification DB model
                const notification = new Notification({
                    userId: plan.userId,
                    title,
                    message,
                    type,
                });
                await notification.save();

                // Live deliver using socket.io if the user happens to have the app open at 8 AM
                try {
                    const socketId = getUserSocket(plan.userId);
                    if (socketId) {
                        const io = getIo();
                        io.to(socketId).emit("newNotification", notification);
                    }
                } catch (e) {
                    console.log("Socket emit skipped (user perhaps offline)");
                }
            }

            console.log("Cron job finished generating daily reminders.");
        } catch (error) {
            console.error("Cron Job Error:", error);
        }
    });
};

module.exports = { startCronJobs };
