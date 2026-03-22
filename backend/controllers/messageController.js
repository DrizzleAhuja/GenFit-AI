const Message = require("../models/Message");

const sendMessage = async (req, res) => {
    const { name, email, item, description, type } = req.body;
    let userId = req.user ? req.user._id : null;

    try {
        if (!userId && email) {
            const User = require("../models/User");
            const user = await User.findOne({ email });
            if (user) userId = user._id;
        }

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

