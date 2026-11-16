"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/_components/Navbar";
import { Text } from "@/_components/Text";
import { Button } from "@/components/ui/button";
import {
  useGetSubjectById,
  useGetSubjectProgress,
  useToggleSubjectProgress,
} from "@/_features/subjects/hooks";
import {
  ArrowLeft,
  ArrowRight,
  Video,
  FileText,
  Clock,
  Download,
  ExternalLink,
  CheckCircle2,
  Calendar,
  BookOpen,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "@/lib/toast";

export default function LectureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  const lectureId = params.lectureId as string;
  const { isArabic } = useLanguage();

  const { data: subject, isLoading } = useGetSubjectById(subjectId);
  const { data: progress } = useGetSubjectProgress(subjectId);
  const toggleMutation = useToggleSubjectProgress(subjectId);

  const ArrowIcon = isArabic ? ArrowRight : ArrowLeft;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bgPrimary text-textPrimary flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const lecture = subject?.lectures?.find((l) => l._id === lectureId);

  if (!subject || !lecture) {
    return (
      <div className="min-h-screen bg-bgPrimary text-textPrimary flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto px-4 py-24 text-center flex flex-col items-center justify-center">
          <Video className="h-12 w-12 text-textSecondary mb-4 opacity-40" />
          <Text as="h2" size="xl" font="bold" color="primary" className="mb-2">
            {isArabic ? "المحاضرة غير موجودة" : "Lecture Not Found"}
          </Text>
          <Link href={`/subjects/${subjectId}`}>
            <Button variant="outline" className="rounded-xl text-xs mt-4 gap-2">
              <ArrowIcon className="h-4 w-4" />
              <span>{isArabic ? "العودة للمادة" : "Back to Subject"}</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = progress?.completedLectures?.includes(lectureId);

  const handleToggleComplete = () => {
    toggleMutation.mutate(
      { type: "lecture", itemId: lectureId },
      {
        onSuccess: () => {
          toast.success(
            isCompleted
              ? isArabic
                ? "تم إلغاء تحديد إكمال المحاضرة"
                : "Marked as incomplete"
              : isArabic
              ? "أحسنت! تم إكمال المحاضرة"
              : "Great job! Lecture marked as completed",
          );
        },
      },
    );
  };

  const hasVideo = Boolean(lecture.videoUrl);
  const hasPdf = Boolean(lecture.fileUrl);

  return (
    <div className="min-h-screen bg-bgPrimary text-textPrimary flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Back Link & Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/subjects/${subjectId}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-textSecondary hover:text-primary transition-colors"
          >
            <ArrowIcon className="h-4 w-4" />
            <span>
              {isArabic
                ? `العودة إلى ${subject.title}`
                : `Back to ${subject.title}`}
            </span>
          </Link>

          <Button
            onClick={handleToggleComplete}
            disabled={toggleMutation.isPending}
            variant={isCompleted ? "default" : "outline"}
            className={`rounded-xl text-xs font-bold gap-2 cursor-pointer shadow-xs ${
              isCompleted
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "border-primary/40 text-primary hover:bg-primary/10"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>
              {isCompleted
                ? isArabic
                  ? "مكتملة ✓"
                  : "Completed ✓"
                : isArabic
                ? "تحديد كمكتملة"
                : "Mark as Completed"}
            </span>
          </Button>
        </div>

        {/* Lecture Header */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-borderPrimary/60 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5" />
              <span>{isArabic ? "محاضرة دراسية" : "Course Lecture"}</span>
            </span>
            {lecture.order !== undefined && (
              <span className="text-xs text-textSecondary font-semibold">
                #{lecture.order}
              </span>
            )}
          </div>

          <Text as="h1" size="2xl" font="black" color="primary">
            {lecture.title}
          </Text>

          {lecture.description && (
            <Text as="p" size="sm" color="secondary" className="leading-relaxed whitespace-pre-wrap">
              {lecture.description}
            </Text>
          )}

          <div className="flex items-center gap-4 text-xs text-textSecondary pt-2 border-t border-borderPrimary/40">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span>{subject.title}</span>
            </span>
            {lecture.createdAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(lecture.createdAt).toLocaleDateString()}</span>
              </span>
            )}
          </div>
        </div>

        {/* Video Player Display */}
        {hasVideo && (
          <div className="glass-card rounded-3xl overflow-hidden border border-borderPrimary/60 p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span>{isArabic ? "مشغل الفيديو" : "Video Player"}</span>
              </span>
              <a
                href={lecture.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-textSecondary hover:text-primary inline-flex items-center gap-1 font-semibold"
              >
                <span>{isArabic ? "فتح في نافذة جديدة" : "Open external"}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black/90 shadow-inner flex items-center justify-center">
              <video
                src={lecture.videoUrl}
                controls
                controlsList="nodownload"
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}

        {/* PDF Document Viewer Display */}
        {hasPdf && (
          <div className="glass-card rounded-3xl overflow-hidden border border-borderPrimary/60 p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>{isArabic ? "المستند التابع للمحاضرة (PDF)" : "Lecture Document (PDF)"}</span>
              </span>
              <a
                href={lecture.fileUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{isArabic ? "تحميل الملف" : "Download PDF"}</span>
              </a>
            </div>

            <div className="w-full h-[650px] rounded-2xl overflow-hidden border border-borderPrimary/60 bg-bgPrimary">
              <iframe
                src={`${lecture.fileUrl}#toolbar=1`}
                title={lecture.title}
                className="w-full h-full rounded-2xl"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
