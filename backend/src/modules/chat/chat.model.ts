import { Schema, model, Document, Types } from "mongoose";

export interface IGlobalMessage extends Document {
  sender: Types.ObjectId;
  content: string;
  replyTo?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const GlobalMessageSchema = new Schema<IGlobalMessage>(
  {
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
  },
  {
    timestamps: true,
  },
);

export const GlobalMessage = model<IGlobalMessage>(
  "GlobalMessage",
  GlobalMessageSchema,
);
