import { Document, Schema, model, Types } from "mongoose";

export interface IQuestion {
  _id?: Types.ObjectId;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface ILecture {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  fileUrl: string;
  order: number;
  createdAt: Date;
}

export interface ISummary {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  fileUrl: string;
  createdAt: Date;
}

export interface IRecord {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  audioUrl: string;
  duration: string | number;
  createdAt: Date;
}

export interface IQuiz {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  durationInMinutes: number;
  questions: IQuestion[];
  createdAt: Date;
}

export interface ISubject extends Document {
  title: string;
  description: string;
  code: string;
  department: string;
  thumbnail?: {
    url: string;
    publicId: string | null;
  };
  createdBy: Types.ObjectId;
  lectures: Types.DocumentArray<ILecture>;
  summaries: Types.DocumentArray<ISummary>;
  records: Types.DocumentArray<IRecord>;
  quizzes: Types.DocumentArray<IQuiz>;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    questionText: { type: String, required: true, trim: true },
    options: [{ type: String, required: true, trim: true }],
    correctAnswer: { type: String, required: true, trim: true },
    explanation: { type: String, default: "", trim: true },
  },
  { _id: true },
);

const LectureSchema = new Schema<ILecture>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    videoUrl: { type: String, default: "", trim: true },
    fileUrl: { type: String, default: "", trim: true },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const SummarySchema = new Schema<ISummary>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    fileUrl: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const RecordSchema = new Schema<IRecord>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    audioUrl: { type: String, required: true, trim: true },
    duration: { type: Schema.Types.Mixed, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const QuizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    durationInMinutes: { type: Number, required: true, default: 15 },
    questions: [QuestionSchema],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const SubjectSchema = new Schema<ISubject>(
  {
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual counts for lightweight summaries in listings
SubjectSchema.virtual("lecturesCount").get(function (this: ISubject) {
  return this.lectures?.length || 0;
});
SubjectSchema.virtual("summariesCount").get(function (this: ISubject) {
  return this.summaries?.length || 0;
});
SubjectSchema.virtual("recordsCount").get(function (this: ISubject) {
  return this.records?.length || 0;
});
SubjectSchema.virtual("quizzesCount").get(function (this: ISubject) {
  return this.quizzes?.length || 0;
});

export const Subject = model<ISubject>("Subject", SubjectSchema);
