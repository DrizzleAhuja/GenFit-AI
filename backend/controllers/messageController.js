const Message = require("../models/Message");

const sendMessage = async (req, res) => {
    const { name, email, item, description, type } = req.body;
    const userId = req.user ? req.user._id : null;

    try {
        const newMessage = new Message({
            name,
            email,
            item, 
            description,
            type: type || "feedback",
            user: userId
        });

        await newMessage.save();
        res.status(200).json({ success: true, message: "Feedback sent successfully!" });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ success: false, error: "Failed to send message" });
    }
};

module.exports = {
    sendMessage,
};

