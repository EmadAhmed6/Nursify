import mongoose, { Schema, model, Types } from "mongoose";
const NotificationSchema = new Schema({
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["follow", "subject_update", "system"],
        required: true,
    },
    subject: {
        type: mongoose.Schema.ObjectId,
        ref: "Subject",
        required: false,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const Notification = model("Notification", NotificationSchema);
export default Notification;
//# sourceMappingURL=notifications.model.js.map