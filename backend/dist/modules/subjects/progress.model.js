import { Schema, model, Document, Types } from "mongoose";
const userProgressSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    subject: {
        type: Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
        index: true,
    },
    completedLectures: [
        {
            type: Schema.Types.ObjectId,
        },
    ],
    completedSummaries: [
        {
            type: Schema.Types.ObjectId,
        },
    ],
    completedRecords: [
        {
            type: Schema.Types.ObjectId,
        },
    ],
    completedQuizzes: [
        {
            type: Schema.Types.ObjectId,
        },
    ],
    percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
}, {
    timestamps: true,
});
userProgressSchema.index({ user: 1, subject: 1 }, { unique: true });
export const UserProgress = model("UserProgress", userProgressSchema);
//# sourceMappingURL=progress.model.js.map