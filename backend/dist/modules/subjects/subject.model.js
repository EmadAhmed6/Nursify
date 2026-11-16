import { Document, Schema, model, Types } from "mongoose";
const QuestionSchema = new Schema({
    questionText: { type: String, required: true, trim: true },
    options: [{ type: String, required: true, trim: true }],
    correctAnswer: { type: String, required: true, trim: true },
    explanation: { type: String, default: "", trim: true },
}, { _id: true });
const LectureSchema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    videoUrl: { type: String, default: "", trim: true },
    fileUrl: { type: String, default: "", trim: true },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
}, { _id: true });
const SummarySchema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    fileUrl: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
}, { _id: true });
const RecordSchema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    audioUrl: { type: String, required: true, trim: true },
    duration: { type: Schema.Types.Mixed, default: "" },
    createdAt: { type: Date, default: Date.now },
}, { _id: true });
const QuizSchema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    durationInMinutes: { type: Number, required: true, default: 15 },
    questions: [QuestionSchema],
    createdAt: { type: Date, default: Date.now },
}, { _id: true });
const SubjectSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 200,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minLength: 5,
        maxLength: 3000,
    },
    code: {
        type: String,
        default: "",
        trim: true,
        maxLength: 50,
    },
    department: {
        type: String,
        default: "General Nursing",
        trim: true,
        maxLength: 100,
    },
    thumbnail: {
        type: {
            url: { type: String, default: "" },
            publicId: { type: String, default: null },
        },
        default: {
            url: "",
            publicId: null,
        },
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    lectures: [LectureSchema],
    summaries: [SummarySchema],
    records: [RecordSchema],
    quizzes: [QuizSchema],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Virtual counts for lightweight summaries in listings
SubjectSchema.virtual("lecturesCount").get(function () {
    return this.lectures?.length || 0;
});
SubjectSchema.virtual("summariesCount").get(function () {
    return this.summaries?.length || 0;
});
SubjectSchema.virtual("recordsCount").get(function () {
    return this.records?.length || 0;
});
SubjectSchema.virtual("quizzesCount").get(function () {
    return this.quizzes?.length || 0;
});
export const Subject = model("Subject", SubjectSchema);
//# sourceMappingURL=subject.model.js.map