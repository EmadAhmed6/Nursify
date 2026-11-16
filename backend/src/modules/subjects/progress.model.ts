import { Schema, model, Document, Types } from "mongoose";

export interface IUserProgress extends Document {
  user: Types.ObjectId;
  subject: Types.ObjectId;
  completedLectures: Types.ObjectId[];
  completedSummaries: Types.ObjectId[];
  completedRecords: Types.ObjectId[];
  completedQuizzes: Types.ObjectId[];
  percentage: number;
  updatedAt: Date;
  createdAt: Date;
}

const userProgressSchema = new Schema<IUserProgress>(
  {
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
  },
  {
    timestamps: true,
  },
);

userProgressSchema.index({ user: 1, subject: 1 }, { unique: true });

export const UserProgress = model<IUserProgress>("UserProgress", userProgressSchema);
