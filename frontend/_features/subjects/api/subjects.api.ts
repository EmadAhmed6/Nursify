import { axiosClient } from "@/lib/axiosClient";
import type {
  Subject,
  SubjectsResponse,
  Lecture,
  Summary,
  AudioRecord,
  Quiz,
  SubjectProgress,
} from "../types/Subject";

export interface GetSubjectsParams {
  search?: string;
  department?: string;
  pageNumber?: number;
  limit?: number;
}

export const getAllSubjects = async (
  params?: GetSubjectsParams,
): Promise<SubjectsResponse> => {
  const res = await axiosClient.get("/subjects", { params });
  return res.data?.data;
};

export const getSubjectById = async (subjectId: string): Promise<Subject> => {
  const res = await axiosClient.get(`/subjects/${subjectId}`);
  return res.data?.data;
};

export const createSubject = async (formData: FormData): Promise<Subject> => {
  const res = await axiosClient.post("/subjects", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data;
};

export const updateSubject = async (
  subjectId: string,
  formData: FormData,
): Promise<Subject> => {
  const res = await axiosClient.put(`/subjects/${subjectId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data;
};

export const deleteSubject = async (
  subjectId: string,
): Promise<{ success: boolean; message: string }> => {
  const res = await axiosClient.delete(`/subjects/${subjectId}`);
  return res.data;
};

// PATCH LECTURES (Supports FormData or JSON)
export type PatchLecturePayload =
  | FormData
  | {
      action: "add" | "remove";
      lectureId?: string;
      lecture?: Partial<Lecture>;
      title?: string;
      description?: string;
      videoUrl?: string;
      fileUrl?: string;
      order?: number;
    };

export const patchLectures = async (
  subjectId: string,
  payload: PatchLecturePayload,
): Promise<Subject> => {
  const isForm = payload instanceof FormData;
  const res = await axiosClient.patch(`/subjects/${subjectId}/lectures`, payload, {
    headers: isForm ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return res.data?.data;
};

// PATCH SUMMARIES (Supports FormData or JSON)
export type PatchSummaryPayload =
  | FormData
  | {
      action: "add" | "remove";
      summaryId?: string;
      summary?: Partial<Summary>;
      title?: string;
      description?: string;
      fileUrl?: string;
    };

export const patchSummaries = async (
  subjectId: string,
  payload: PatchSummaryPayload,
): Promise<Subject> => {
  const isForm = payload instanceof FormData;
  const res = await axiosClient.patch(`/subjects/${subjectId}/summaries`, payload, {
    headers: isForm ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return res.data?.data;
};

// PATCH AUDIO RECORDS (Supports FormData or JSON)
export type PatchRecordPayload =
  | FormData
  | {
      action: "add" | "remove";
      recordId?: string;
      record?: Partial<AudioRecord>;
      title?: string;
      description?: string;
      audioUrl?: string;
      duration?: string | number;
    };

export const patchRecords = async (
  subjectId: string,
  payload: PatchRecordPayload,
): Promise<Subject> => {
  const isForm = payload instanceof FormData;
  const res = await axiosClient.patch(`/subjects/${subjectId}/records`, payload, {
    headers: isForm ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return res.data?.data;
};

// PATCH QUIZZES
export interface PatchQuizPayload {
  action: "add" | "remove";
  quizId?: string;
  quiz?: Partial<Quiz>;
  title?: string;
  description?: string;
  durationInMinutes?: number;
  questions?: Quiz["questions"];
}

export const patchQuizzes = async (
  subjectId: string,
  payload: PatchQuizPayload,
): Promise<Subject> => {
  const res = await axiosClient.patch(`/subjects/${subjectId}/quizzes`, payload);
  return res.data?.data;
};

// PROGRESS API
export const getSubjectProgress = async (
  subjectId: string,
): Promise<SubjectProgress> => {
  const res = await axiosClient.get(`/subjects/${subjectId}/progress`);
  return res.data?.data;
};

export const toggleSubjectProgress = async (
  subjectId: string,
  data: { type: "lecture" | "summary" | "record" | "quiz"; itemId: string },
): Promise<SubjectProgress> => {
  const res = await axiosClient.post(`/subjects/${subjectId}/progress/toggle`, data);
  return res.data?.data;
};
