import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  patchLectures,
  patchSummaries,
  patchRecords,
  patchQuizzes,
  getSubjectProgress,
  toggleSubjectProgress,
  type GetSubjectsParams,
  type PatchLecturePayload,
  type PatchSummaryPayload,
  type PatchRecordPayload,
  type PatchQuizPayload,
} from "../api";

export const SUBJECTS_QUERY_KEY = ["subjects"];
export const subjectDetailsQueryKey = (subjectId: string) => ["subject", subjectId];
export const subjectProgressQueryKey = (subjectId: string) => ["subject-progress", subjectId];

export const useGetSubjects = (params?: GetSubjectsParams) => {
  return useQuery({
    queryKey: [...SUBJECTS_QUERY_KEY, params],
    queryFn: () => getAllSubjects(params),
  });
};

export const useGetSubjectById = (subjectId: string) => {
  return useQuery({
    queryKey: subjectDetailsQueryKey(subjectId),
    queryFn: () => getSubjectById(subjectId),
    enabled: Boolean(subjectId),
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createSubject(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY });
    },
  });
};

export const useUpdateSubject = (subjectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => updateSubject(subjectId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: subjectDetailsQueryKey(subjectId) });
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subjectId: string) => deleteSubject(subjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY });
    },
  });
};

export const usePatchLectures = (subjectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PatchLecturePayload) => patchLectures(subjectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectDetailsQueryKey(subjectId) });
      queryClient.invalidateQueries({ queryKey: subjectProgressQueryKey(subjectId) });
    },
  });
};

export const usePatchSummaries = (subjectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PatchSummaryPayload) => patchSummaries(subjectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectDetailsQueryKey(subjectId) });
      queryClient.invalidateQueries({ queryKey: subjectProgressQueryKey(subjectId) });
    },
  });
};

export const usePatchRecords = (subjectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PatchRecordPayload) => patchRecords(subjectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectDetailsQueryKey(subjectId) });
      queryClient.invalidateQueries({ queryKey: subjectProgressQueryKey(subjectId) });
    },
  });
};

export const usePatchQuizzes = (subjectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PatchQuizPayload) => patchQuizzes(subjectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectDetailsQueryKey(subjectId) });
      queryClient.invalidateQueries({ queryKey: subjectProgressQueryKey(subjectId) });
    },
  });
};

export const useGetSubjectProgress = (subjectId: string) => {
  return useQuery({
    queryKey: subjectProgressQueryKey(subjectId),
    queryFn: () => getSubjectProgress(subjectId),
    enabled: Boolean(subjectId),
  });
};

export const useToggleSubjectProgress = (subjectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { type: "lecture" | "summary" | "record" | "quiz"; itemId: string }) =>
      toggleSubjectProgress(subjectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectProgressQueryKey(subjectId) });
    },
  });
};
