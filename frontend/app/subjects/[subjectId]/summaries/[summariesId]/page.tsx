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
  FileText,
  Download,
  ExternalLink,
  CheckCircle2,
  Calendar,
  BookOpen,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "@/lib/toast";

export default function SummaryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  // Support either [summariesId] or [summaryId] param name
  const summaryId = (params.summariesId || params.summaryId) as string;
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

  const summary = subject?.summaries?.find((s) => s._id === summaryId);

  if (!subject || !summary) {
    return (
      <div className="min-h-screen bg-bgPrimary text-textPrimary flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto px-4 py-24 text-center flex flex-col items-center justify-center">
          <FileText className="h-12 w-12 text-textSecondary mb-4 opacity-40" />
          <Text as="h2" size="xl" font="bold" color="primary" className="mb-2">
            {isArabic ? "الملخص غير موجود" : "Summary Not Found"}
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

  const isCompleted = progress?.completedSummaries?.includes(summaryId);

  const handleToggleComplete = () => {
    toggleMutation.mutate(
      { type: "summary", itemId: summaryId },
      {
        onSuccess: () => {
          toast.success(
            isCompleted
              ? isArabic
                ? "تم إلغاء تحديد قراءة الملخص"
                : "Marked as unread"
              : isArabic
              ? "رائع! تم تحديد قراءة الملخص"
              : "Great! Summary marked as completed",
          );
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-bgPrimary text-textPrimary flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Back Link & Complete Button */}
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
                  ? "تمت قراءته ✓"
                  : "Completed ✓"
                : isArabic
                ? "تحديد كمكتمل"
                : "Mark as Completed"}
            </span>
          </Button>
        </div>

        {/* Summary Info Header */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-borderPrimary/60 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span>{isArabic ? "ملخص دراسي PDF" : "Study Summary PDF"}</span>
            </span>

            {summary.fileUrl && (
              <a
                href={summary.fileUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primaryHover text-white text-xs font-bold transition-all shadow-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{isArabic ? "تحميل الملخص" : "Download Document"}</span>
              </a>
            )}
          </div>

          <Text as="h1" size="2xl" font="black" color="primary">
            {summary.title}
          </Text>

          {summary.description && (
            <Text as="p" size="sm" color="secondary" className="leading-relaxed whitespace-pre-wrap">
              {summary.description}
            </Text>
          )}

          <div className="flex items-center gap-4 text-xs text-textSecondary pt-2 border-t border-borderPrimary/40">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span>{subject.title}</span>
            </span>
            {summary.createdAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(summary.createdAt).toLocaleDateString()}</span>
              </span>
            )}
          </div>
        </div>

        {/* PDF Embedded Document Viewer */}
        {summary.fileUrl ? (
          <div className="glass-card rounded-3xl overflow-hidden border border-borderPrimary/60 p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>{isArabic ? "معاينة الملف المرفوع" : "PDF Document Viewer"}</span>
              </span>
              <a
                href={summary.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-textSecondary hover:text-primary inline-flex items-center gap-1 font-semibold"
              >
                <span>{isArabic ? "فتح في نافذة كاملة" : "Open full window"}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="w-full h-[750px] rounded-2xl overflow-hidden border border-borderPrimary/60 bg-bgPrimary">
              <iframe
                src={`${summary.fileUrl}#toolbar=1`}
                title={summary.title}
                className="w-full h-full rounded-2xl"
              />
            </div>
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-bgSecondary/40 border border-borderPrimary/60">
            <FileText className="h-10 w-10 mx-auto mb-2 text-textSecondary opacity-30" />
            <Text as="p" size="xs" color="secondary">
              {isArabic ? "لم يتم إرفاق ملف لهذا الملخص." : "No file attached to this summary."}
            </Text>
          </div>
        )}
      </main>
    </div>
  );
}
