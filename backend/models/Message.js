const mongoose = require('mongoose')
const messageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    rollNo: {
        type: String,
        default: "N/A"
    },
    type: {
        type: String,
        enum: ["feedback", "support"],
        default: "feedback"
    },
    email: {

        type: String
    },
    item: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },

    fakeClaim: {
        type: Boolean,
        default: false,
    },
    reportId: {
        type: String,
        default: "", // Optional field
    },
    acknowledged: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
