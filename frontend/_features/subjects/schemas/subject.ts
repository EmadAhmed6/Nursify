import { z } from "zod";

export const QuestionSchema = z.object({
  questionText: z.string().min(3, "Question text must be at least 3 characters"),
  options: z.array(z.string().min(1, "Option cannot be empty")).min(2, "At least 2 options are required"),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  explanation: z.string().optional().default(""),
});

export const CreateLectureSchema = z.object({
  title: z.string().min(2, "Lecture title is required"),
  description: z.string().optional().default(""),
  videoUrl: z.string().optional().default(""),
  fileUrl: z.string().optional().default(""),
  order: z.coerce.number().int().nonnegative().optional().default(0),
});

export const CreateSummarySchema = z.object({
  title: z.string().min(2, "Summary title is required"),
  description: z.string().optional().default(""),
  fileUrl: z.string().optional().default(""),
});

export const CreateRecordSchema = z.object({
  title: z.string().min(2, "Audio record title is required"),
  description: z.string().optional().default(""),
  audioUrl: z.string().optional().default(""),
  duration: z.string().optional().default(""),
});

export const CreateQuizSchema = z.object({
  title: z.string().min(2, "Quiz title is required"),
  description: z.string().optional().default(""),
  durationInMinutes: z.coerce.number().positive().default(15),
  questions: z.array(QuestionSchema).min(1, "At least 1 question is required"),
});

export const CreateSubjectSchema = z.object({
  title: z.string().min(2, "Subject title must be at least 2 characters").max(200),
  description: z.string().min(5, "Subject description must be at least 5 characters").max(3000),
  code: z.string().max(50).optional().default(""),
  department: z.string().max(100).optional().default("General Nursing"),
});

export type IQuestionInput = z.infer<typeof QuestionSchema>;
export type ICreateLectureInput = z.infer<typeof CreateLectureSchema>;
export type ICreateSummaryInput = z.infer<typeof CreateSummarySchema>;
export type ICreateRecordInput = z.infer<typeof CreateRecordSchema>;
export type ICreateQuizInput = z.infer<typeof CreateQuizSchema>;
export type ICreateSubjectInput = z.infer<typeof CreateSubjectSchema>;
