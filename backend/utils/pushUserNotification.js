const Notification = require("../models/Notification");

/**
 * Save a notification for a user and emit "newNotification" over Socket.IO when they are connected.
 */
async function pushUserNotification(userId, { title, message, type = "system" }) {
  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
  });

  try {
    const { getUserSocket, getIo } = require("./socket");
    const id = userId && typeof userId.toString === "function" ? userId.toString() : String(userId);
    const socketId = getUserSocket(id);
    if (socketId) {
      getIo().to(socketId).emit("newNotification", notification);
    }
  } catch (e) {
    console.warn("[pushUserNotification] Socket push skipped:", e.message);
  }

  return notification;
}

module.exports = { pushUserNotification };
