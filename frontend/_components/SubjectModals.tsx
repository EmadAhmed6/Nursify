"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Loader2,
  Video,
  FileText,
  Mic,
  HelpCircle,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/_components/Text";
import Error from "@/_components/Error";
import { toast } from "@/lib/toast";
import {
  CreateLectureSchema,
  CreateSummarySchema,
  CreateRecordSchema,
  CreateQuizSchema,
  type ICreateLectureInput,
  type ICreateSummaryInput,
  type ICreateRecordInput,
  type ICreateQuizInput,
} from "@/_features/subjects/schemas/subject";
import {
  usePatchLectures,
  usePatchSummaries,
  usePatchRecords,
  usePatchQuizzes,
} from "@/_features/subjects/hooks";
import { useLanguage } from "@/context/LanguageContext";

// ─── ADD LECTURE MODAL ───────────────────────────────────────
export function AddLectureModal({
  isOpen,
  onClose,
  subjectId,
}: {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
}) {
  const { isArabic } = useLanguage();
  const patchMutation = usePatchLectures(subjectId);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ICreateLectureInput>({
    resolver: zodResolver(CreateLectureSchema as any),
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
      fileUrl: "",
      order: 0,
    },
  });

  if (!isOpen) return null;

  const onSubmit = (data: ICreateLectureInput) => {
    const formData = new FormData();
    formData.append("action", "add");
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (data.order !== undefined) formData.append("order", String(data.order));
    if (data.videoUrl) formData.append("videoUrl", data.videoUrl);
    if (data.fileUrl) formData.append("fileUrl", data.fileUrl);

    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    patchMutation.mutate(formData, {
      onSuccess: () => {
        toast.success(
          isArabic
            ? "تمت إضافة المحاضرة بنجاح!"
            : "Lecture added successfully!",
        );
        reset();
        setSelectedFile(null);
        onClose();
      },
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message ||
            (isArabic ? "فشل إضافة المحاضرة" : "Failed to add lecture"),
        );
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-bgSecondary border border-borderPrimary rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-borderPrimary/60">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Video className="h-5 w-5" />
            <span>{isArabic ? "إضافة محاضرة جديدة" : "Add Lecture"}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="lecture-title" className="text-xs font-semibold">
              {isArabic ? "عنوان المحاضرة *" : "Lecture Title *"}
            </Label>
            <Input
              id="lecture-title"
              {...register("title")}
              placeholder={
                isArabic
                  ? "مثال: مهارات التمريض السريري 1"
                  : "e.g., Clinical Nursing Skills 1"
              }
              className="rounded-xl text-xs"
            />
            {errors.title?.message && <Error error={errors.title.message} />}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lecture-desc" className="text-xs font-semibold">
              {isArabic ? "الوصف" : "Description"}
            </Label>
            <textarea
              id="lecture-desc"
              {...register("description")}
              rows={2}
              placeholder={
                isArabic
                  ? "نبذة موجزة عن موضوع المحاضرة..."
                  : "Brief overview of what is covered..."
              }
              className="w-full px-3 py-2 text-xs rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Real File Upload (Video or PDF) */}
          <div className="space-y-1.5">
            <Label htmlFor="lecture-file" className="text-xs font-semibold flex items-center justify-between">
              <span>{isArabic ? "ملف المحاضرة (فيديو أو PDF)" : "Lecture File (Video or PDF)"}</span>
              <span className="text-[10px] text-textSecondary">Max 100MB</span>
            </Label>
            <div className="relative border-2 border-dashed border-borderPrimary hover:border-primary/60 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-bgPrimary/50">
              <input
                id="lecture-file"
                type="file"
                accept="video/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setSelectedFile(file || null);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                <Upload className="h-6 w-6 text-primary opacity-80" />
                <span className="text-xs font-medium text-textPrimary truncate max-w-xs">
                  {selectedFile
                    ? selectedFile.name
                    : isArabic
                    ? "اختر ملف فيديو (MP4, WebM) أو PDF"
                    : "Upload video (MP4, WebM) or PDF"}
                </span>
                <span className="text-[10px] text-textSecondary">
                  {isArabic ? "أو يمكنك كتابة رابط بالأسفل" : "or specify URL below"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lecture-videoUrl" className="text-xs font-semibold">
                {isArabic ? "رابط فيديو خارجي" : "Video URL (optional)"}
              </Label>
              <Input
                id="lecture-videoUrl"
                {...register("videoUrl")}
                placeholder="https://..."
                className="rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lecture-order" className="text-xs font-semibold">
                {isArabic ? "ترتيب العرض" : "Order"}
              </Label>
              <Input
                id="lecture-order"
                type="number"
                {...register("order")}
                placeholder="0"
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={patchMutation.isPending}
              className="rounded-xl text-xs cursor-pointer"
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={patchMutation.isPending}
              className="rounded-xl text-xs font-bold gap-2 cursor-pointer"
            >
              {patchMutation.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              <span>{isArabic ? "إضافة المحاضرة" : "Add Lecture"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── ADD SUMMARY MODAL ───────────────────────────────────────
export function AddSummaryModal({
  isOpen,
  onClose,
  subjectId,
}: {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
}) {
  const { isArabic } = useLanguage();
  const patchMutation = usePatchSummaries(subjectId);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ICreateSummaryInput>({
    resolver: zodResolver(CreateSummarySchema as any),
    defaultValues: {
      title: "",
      description: "",
      fileUrl: "",
    },
  });

  if (!isOpen) return null;

  const onSubmit = (data: ICreateSummaryInput) => {
    const formData = new FormData();
    formData.append("action", "add");
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (data.fileUrl) formData.append("fileUrl", data.fileUrl);

    if (selectedFile) {
      formData.append("file", selectedFile);
    } else if (!data.fileUrl) {
      toast.error(isArabic ? "يرجى رفع ملف PDF أو إدخال رابط" : "Please upload a PDF file or enter a document URL");
      return;
    }

    patchMutation.mutate(formData, {
      onSuccess: () => {
        toast.success(
          isArabic
            ? "تمت إضافة الملخص بنجاح!"
            : "Summary added successfully!",
        );
        reset();
        setSelectedFile(null);
        onClose();
      },
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message ||
            (isArabic ? "فشل إضافة الملخص" : "Failed to add summary"),
        );
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-bgSecondary border border-borderPrimary rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-borderPrimary/60">
          <div className="flex items-center gap-2 text-primary font-bold">
            <FileText className="h-5 w-5" />
            <span>{isArabic ? "إضافة ملخص دراسي جديد" : "Add Study Summary"}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="summary-title" className="text-xs font-semibold">
              {isArabic ? "عنوان الملخص *" : "Summary Title *"}
            </Label>
            <Input
              id="summary-title"
              {...register("title")}
              placeholder={
                isArabic
                  ? "مثال: مراجعة شاملة للتشريح الوظيفي"
                  : "e.g., Anatomy & Physiology High-Yield Review"
              }
              className="rounded-xl text-xs"
            />
            {errors.title?.message && <Error error={errors.title.message} />}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="summary-desc" className="text-xs font-semibold">
              {isArabic ? "الوصف" : "Description"}
            </Label>
            <textarea
              id="summary-desc"
              {...register("description")}
              rows={2}
              placeholder={
                isArabic
                  ? "محتويات الملخص وأهم النقاط..."
                  : "Key topics covered in this summary..."
              }
              className="w-full px-3 py-2 text-xs rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Real PDF / Document Upload */}
          <div className="space-y-1.5">
            <Label htmlFor="summary-file" className="text-xs font-semibold flex items-center justify-between">
              <span>{isArabic ? "ملف الملخص (PDF فقط) *" : "Summary File (PDF only) *"}</span>
              <span className="text-[10px] text-textSecondary">PDF up to 100MB</span>
            </Label>
            <div className="relative border-2 border-dashed border-borderPrimary hover:border-primary/60 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-bgPrimary/50">
              <input
                id="summary-file"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setSelectedFile(file || null);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                <Upload className="h-6 w-6 text-primary opacity-80" />
                <span className="text-xs font-medium text-textPrimary truncate max-w-xs">
                  {selectedFile
                    ? selectedFile.name
                    : isArabic
                    ? "اختر ملف PDF لرفعه"
                    : "Upload PDF document"}
                </span>
                <span className="text-[10px] text-textSecondary">
                  {isArabic ? "يدعم ملفات PDF عالية الدقة" : "Supports high-yield study PDFs"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="summary-fileUrl" className="text-xs font-semibold">
              {isArabic ? "أو رابط المستند (بديل)" : "Or Document URL (alternative)"}
            </Label>
            <Input
              id="summary-fileUrl"
              {...register("fileUrl")}
              placeholder="https://..."
              className="rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={patchMutation.isPending}
              className="rounded-xl text-xs cursor-pointer"
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={patchMutation.isPending}
              className="rounded-xl text-xs font-bold gap-2 cursor-pointer"
            >
              {patchMutation.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              <span>{isArabic ? "إضافة الملخص" : "Add Summary"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── ADD AUDIO RECORD MODAL ──────────────────────────────────
export function AddRecordModal({
  isOpen,
  onClose,
  subjectId,
}: {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
}) {
  const { isArabic } = useLanguage();
  const patchMutation = usePatchRecords(subjectId);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ICreateRecordInput>({
    resolver: zodResolver(CreateRecordSchema as any),
    defaultValues: {
      title: "",
      description: "",
      audioUrl: "",
      duration: "",
    },
  });

  if (!isOpen) return null;

  const onSubmit = (data: ICreateRecordInput) => {
    const formData = new FormData();
    formData.append("action", "add");
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (data.duration) formData.append("duration", data.duration);
    if (data.audioUrl) formData.append("audioUrl", data.audioUrl);

    if (selectedFile) {
      formData.append("file", selectedFile);
    } else if (!data.audioUrl) {
      toast.error(isArabic ? "يرجى رفع ملف صوتي أو إدخال رابط صوتي" : "Please upload an audio file or enter an audio URL");
      return;
    }

    patchMutation.mutate(formData, {
      onSuccess: () => {
        toast.success(
          isArabic
            ? "تمت إضافة التسجيل الصوتي بنجاح!"
            : "Audio record added successfully!",
        );
        reset();
        setSelectedFile(null);
        onClose();
      },
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message ||
            (isArabic ? "فشل إضافة التسجيل الصوتي" : "Failed to add audio record"),
        );
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-bgSecondary border border-borderPrimary rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-borderPrimary/60">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Mic className="h-5 w-5" />
            <span>{isArabic ? "إضافة تسجيل صوتي جديد" : "Add Audio Record"}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="record-title" className="text-xs font-semibold">
              {isArabic ? "عنوان التسجيل *" : "Recording Title *"}
            </Label>
            <Input
              id="record-title"
              {...register("title")}
              placeholder={
                isArabic
                  ? "مثال: شرح فارماكولوجي - أدوية القلب"
                  : "e.g., Pharmacology Voice Note - Cardiac Drugs"
              }
              className="rounded-xl text-xs"
            />
            {errors.title?.message && <Error error={errors.title.message} />}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="record-desc" className="text-xs font-semibold">
              {isArabic ? "الوصف" : "Description"}
            </Label>
            <textarea
              id="record-desc"
              {...register("description")}
              rows={2}
              placeholder={
                isArabic
                  ? "نبذة موجزة عن محتوى التسجيل الصوتي..."
                  : "Quick summary of this audio recording..."
              }
              className="w-full px-3 py-2 text-xs rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Real Audio Upload (audio/* only) */}
          <div className="space-y-1.5">
            <Label htmlFor="record-file" className="text-xs font-semibold flex items-center justify-between">
              <span>{isArabic ? "ملف الصوت (ملفات صوتية فقط) *" : "Audio File (Audio only) *"}</span>
              <span className="text-[10px] text-textSecondary">MP3, WAV, M4A up to 100MB</span>
            </Label>
            <div className="relative border-2 border-dashed border-borderPrimary hover:border-primary/60 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-bgPrimary/50">
              <input
                id="record-file"
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setSelectedFile(file || null);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                <Upload className="h-6 w-6 text-primary opacity-80" />
                <span className="text-xs font-medium text-textPrimary truncate max-w-xs">
                  {selectedFile
                    ? selectedFile.name
                    : isArabic
                    ? "اختر ملف صوتي (MP3, WAV, M4A)"
                    : "Upload audio file (MP3, WAV, M4A)"}
                </span>
                <span className="text-[10px] text-textSecondary">
                  {isArabic ? "يقبل فقط صيغ الصوت" : "Audio formats accepted exclusively"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="record-audioUrl" className="text-xs font-semibold">
                {isArabic ? "أو رابط صوتي بديل" : "Or Audio URL"}
              </Label>
              <Input
                id="record-audioUrl"
                {...register("audioUrl")}
                placeholder="https://..."
                className="rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="record-duration" className="text-xs font-semibold">
                {isArabic ? "المدة (مثال: 12:45)" : "Duration (e.g., 12:45)"}
              </Label>
              <Input
                id="record-duration"
                {...register("duration")}
                placeholder="15:30"
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={patchMutation.isPending}
              className="rounded-xl text-xs cursor-pointer"
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={patchMutation.isPending}
              className="rounded-xl text-xs font-bold gap-2 cursor-pointer"
            >
              {patchMutation.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              <span>{isArabic ? "إضافة التسجيل" : "Add Record"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── ADD QUIZ MODAL ──────────────────────────────────────────
export function AddQuizModal({
  isOpen,
  onClose,
  subjectId,
}: {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
}) {
  const { isArabic } = useLanguage();
  const patchMutation = usePatchQuizzes(subjectId);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ICreateQuizInput>({
    resolver: zodResolver(CreateQuizSchema as any),
    defaultValues: {
      title: "",
      description: "",
      durationInMinutes: 15,
      questions: [
        {
          questionText: "",
          options: ["", "", "", ""],
          correctAnswer: "",
          explanation: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  if (!isOpen) return null;

  const onSubmit = (data: ICreateQuizInput) => {
    patchMutation.mutate(
      { action: "add", quiz: data },
      {
        onSuccess: () => {
          toast.success(
            isArabic
              ? "تمت إضافة الاختبار بنجاح!"
              : "Quiz added successfully!",
          );
          reset();
          onClose();
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message ||
              (isArabic ? "فشل إضافة الاختبار" : "Failed to add quiz"),
          );
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-bgSecondary border border-borderPrimary rounded-3xl shadow-2xl my-8 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-borderPrimary/60">
          <div className="flex items-center gap-2 text-primary font-bold">
            <HelpCircle className="h-5 w-5" />
            <span>{isArabic ? "إنشاء اختبار تفاعلي جديد" : "Create Interactive Quiz"}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-6 max-h-[75vh] overflow-y-auto"
        >
          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="quiz-title" className="text-xs font-semibold">
                {isArabic ? "عنوان الاختبار *" : "Quiz Title *"}
              </Label>
              <Input
                id="quiz-title"
                {...register("title")}
                placeholder={
                  isArabic
                    ? "مثال: اختبار قصير - العناية المركزة"
                    : "e.g., ICU Clinical Assessment Quiz"
                }
                className="rounded-xl text-xs"
              />
              {errors.title?.message && <Error error={errors.title.message} />}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quiz-duration" className="text-xs font-semibold">
                {isArabic ? "المدة (بالدقائق)" : "Duration (Minutes)"}
              </Label>
              <Input
                id="quiz-duration"
                type="number"
                {...register("durationInMinutes")}
                placeholder="15"
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quiz-desc" className="text-xs font-semibold">
              {isArabic ? "الوصف" : "Description"}
            </Label>
            <textarea
              id="quiz-desc"
              {...register("description")}
              rows={2}
              placeholder={
                isArabic
                  ? "تعليمات الاختبار أو نبذة عن الموضوع..."
                  : "Instructions or topics covered..."
              }
              className="w-full px-3 py-2 text-xs rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Questions Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <Text as="h3" size="default" font="bold" color="primary">
                {isArabic ? "الأسئلة والخيارات" : "Questions & Options"}
              </Text>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    questionText: "",
                    options: ["", "", "", ""],
                    correctAnswer: "",
                    explanation: "",
                  })
                }
                className="rounded-xl text-xs gap-1.5 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{isArabic ? "إضافة سؤال" : "Add Question"}</span>
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, qIndex) => (
                <div
                  key={field.id}
                  className="p-4 rounded-2xl bg-bgPrimary/60 border border-borderPrimary space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">
                      {isArabic ? `السؤال ${qIndex + 1}` : `Question ${qIndex + 1}`}
                    </span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(qIndex)}
                        className="text-rose-500 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <Input
                    {...register(`questions.${qIndex}.questionText` as const)}
                    placeholder={
                      isArabic
                        ? "نص السؤال الطبي..."
                        : "Enter question prompt..."
                    }
                    className="rounded-xl text-xs"
                  />

                  {/* 4 Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map((optIdx) => (
                      <Input
                        key={optIdx}
                        {...register(
                          `questions.${qIndex}.options.${optIdx}` as const,
                        )}
                        placeholder={
                          isArabic
                            ? `الخيار ${optIdx + 1}`
                            : `Option ${optIdx + 1}`
                        }
                        className="rounded-xl text-xs"
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      {...register(`questions.${qIndex}.correctAnswer` as const)}
                      placeholder={
                        isArabic
                          ? "الإجابة الصحيحة (مطابقة تماماً لأحد الخيارات)"
                          : "Correct Answer (exact option text)"
                      }
                      className="rounded-xl text-xs border-emerald-500/50"
                    />
                    <Input
                      {...register(`questions.${qIndex}.explanation` as const)}
                      placeholder={
                        isArabic
                          ? "التفسير الطبي (اختياري)"
                          : "Explanation / Rationale (optional)"
                      }
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-borderPrimary/60">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={patchMutation.isPending}
              className="rounded-xl text-xs cursor-pointer"
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={patchMutation.isPending}
              className="rounded-xl text-xs font-bold gap-2 cursor-pointer"
            >
              {patchMutation.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              <span>{isArabic ? "حفظ الاختبار" : "Save Quiz"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
