import { Schema, model, Document, Types } from "mongoose";
const GlobalMessageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxLength: 2000,
    },
    replyTo: {
        type: Schema.Types.ObjectId,
        ref: "GlobalMessage",
        default: null,
    },
}, {
    timestamps: true,
});
export const GlobalMessage = model("GlobalMessage", GlobalMessageSchema);
//# sourceMappingURL=chat.model.js.map