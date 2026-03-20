const Notification = require("../models/Notification");

exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ status: "error", message: "Notification not found" });
        }
        res.status(200).json(notification);
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        res.status(200).json({ status: "success", message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
