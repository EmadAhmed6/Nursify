"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/_components/Navbar";
import { Text } from "@/_components/Text";
import { Button } from "@/components/ui/button";
import {
  useGetSubjectById,
  usePatchLectures,
  usePatchSummaries,
  usePatchRecords,
  usePatchQuizzes,
  useGetSubjectProgress,
  useToggleSubjectProgress,
} from "@/_features/subjects/hooks";
import { useGetAuthMeQuery } from "@/_features/auth/hooks";
import {
  BookOpen,
  Video,
  FileText,
  Mic,
  HelpCircle,
  Plus,
  Trash2,
  Clock,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Download,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  ShieldCheck,
  Calendar,
  Sparkles,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  AddLectureModal,
  AddSummaryModal,
  AddRecordModal,
  AddQuizModal,
} from "@/_components/SubjectModals";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "@/lib/toast";
import type { Quiz } from "@/_features/subjects/types/Subject";

type TabType = "lectures" | "summaries" | "records" | "quizzes";

export default function SubjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  const { isArabic } = useLanguage();

  const { data: currentUser } = useGetAuthMeQuery();
  const { data: subject, isLoading, isError } = useGetSubjectById(subjectId);
  const { data: progress } = useGetSubjectProgress(subjectId);
  const toggleProgressMutation = useToggleSubjectProgress(subjectId);

  const [activeTab, setActiveTab] = useState<TabType>("lectures");

  // Modals state (Admin/SuperAdmin only)
  const [isAddLectureOpen, setIsAddLectureOpen] = useState(false);
  const [isAddSummaryOpen, setIsAddSummaryOpen] = useState(false);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [isAddQuizOpen, setIsAddQuizOpen] = useState(false);

  // Interactive Quiz Taking state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Mutations for removing items
  const patchLecturesMutation = usePatchLectures(subjectId);
  const patchSummariesMutation = usePatchSummaries(subjectId);
  const patchRecordsMutation = usePatchRecords(subjectId);
  const patchQuizzesMutation = usePatchQuizzes(subjectId);

  const isAdminOrSuperAdmin =
    currentUser?.role === "admin" || currentUser?.role === "superadmin";

  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

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

  if (isError || !subject) {
    return (
      <div className="min-h-screen bg-bgPrimary text-textPrimary flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto px-4 py-24 text-center flex flex-col items-center justify-center">
          <BookOpen className="h-12 w-12 text-textSecondary mb-4 opacity-40" />
          <Text as="h2" size="xl" font="bold" color="primary" className="mb-2">
            {isArabic ? "المادة الدراسية غير موجودة" : "Subject Not Found"}
          </Text>
          <Text as="p" size="xs" color="secondary" className="mb-6">
            {isArabic
              ? "تأكد من صحة الرابط أو تواصل مع إدارة المنصة."
              : "Check the URL or contact the platform administrator."}
          </Text>
          <Link href="/">
            <Button className="rounded-xl text-xs gap-2">
              <ArrowIcon className="h-4 w-4" />
              <span>{isArabic ? "العودة للرئيسية" : "Back to Home"}</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Handle deletions
  const handleRemoveLecture = (id?: string) => {
    if (!id) return;
    if (confirm(isArabic ? "هل أنت متأكد من حذف هذه المحاضرة؟" : "Delete this lecture?")) {
      patchLecturesMutation.mutate(
        { action: "remove", lectureId: id },
        {
          onSuccess: () => toast.success(isArabic ? "تم حذف المحاضرة" : "Lecture deleted"),
        },
      );
    }
  };

  const handleRemoveSummary = (id?: string) => {
    if (!id) return;
    if (confirm(isArabic ? "هل أنت متأكد من حذف هذا الملخص؟" : "Delete this summary?")) {
      patchSummariesMutation.mutate(
        { action: "remove", summaryId: id },
        {
          onSuccess: () => toast.success(isArabic ? "تم حذف الملخص" : "Summary deleted"),
        },
      );
    }
  };

  const handleRemoveRecord = (id?: string) => {
    if (!id) return;
    if (confirm(isArabic ? "هل أنت متأكد من حذف هذا التسجيل؟" : "Delete this record?")) {
      patchRecordsMutation.mutate(
        { action: "remove", recordId: id },
        {
          onSuccess: () => toast.success(isArabic ? "تم حذف التسجيل" : "Record deleted"),
        },
      );
    }
  };

  const handleRemoveQuiz = (id?: string) => {
    if (!id) return;
    if (confirm(isArabic ? "هل أنت متأكد من حذف هذا الاختبار؟" : "Delete this quiz?")) {
      patchQuizzesMutation.mutate(
        { action: "remove", quizId: id },
        {
          onSuccess: () => toast.success(isArabic ? "تم حذف الاختبار" : "Quiz deleted"),
        },
      );
    }
  };

  // Toggle Item Progress
  const handleToggleItem = (
    type: "lecture" | "summary" | "record" | "quiz",
    itemId?: string,
  ) => {
    if (!itemId) return;
    toggleProgressMutation.mutate({ type, itemId });
  };

  // Interactive Quiz Functions
  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setCurrentQuestionIndex(0);
  };

  const handleSelectOption = (qIdx: number, option: string) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: option }));
  };

  const calculateScore = () => {
    if (!activeQuiz) return 0;
    let score = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx]?.trim() === q.correctAnswer.trim()) {
        score++;
      }
    });
    return score;
  };

  const currentPercentage = progress?.percentage || 0;

  return (
    <div className="min-h-screen bg-bgPrimary text-textPrimary flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-textSecondary mb-6 font-medium">
          <Link href="/" className="hover:text-primary transition-colors">
            {isArabic ? "المواد الدراسية" : "Subjects"}
          </Link>
          <span>/</span>
          <span className="text-primary truncate max-w-xs">{subject.title}</span>
        </div>

        {/* Subject Hero Header */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-borderPrimary/60 mb-6 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Thumbnail */}
            {subject.thumbnail?.url ? (
              <div className="md:col-span-4 h-48 sm:h-56 rounded-2xl overflow-hidden border border-borderPrimary/60 shadow-md">
                <img
                  src={subject.thumbnail.url}
                  alt={subject.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="md:col-span-4 h-48 sm:h-56 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center text-primary">
                <BookOpen className="h-16 w-16 mb-2 opacity-80" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {subject.code || "NURSING"}
                </span>
              </div>
            )}

            {/* Info */}
            <div className="md:col-span-8 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {subject.code && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-primary text-primary-foreground tracking-wide">
                    {subject.code}
                  </span>
                )}
                {subject.department && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-secondary/10 text-primary border border-borderPrimary/60">
                    {subject.department}
                  </span>
                )}
              </div>

              <Text as="h1" size="3xl" font="black" color="primary" className="leading-tight">
                {subject.title}
              </Text>

              <Text as="p" size="xs" color="secondary" className="leading-relaxed">
                {subject.description}
              </Text>

              {/* Creator Info */}
              {subject.createdBy && (
                <div className="pt-2 flex items-center gap-2.5 text-xs text-textSecondary">
                  {subject.createdBy.profilePicture?.url ? (
                    <img
                      src={subject.createdBy.profilePicture.url}
                      alt={subject.createdBy.username}
                      className="h-7 w-7 rounded-full object-cover border border-borderPrimary"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <span>
                    {isArabic ? "بواسطة" : "By"}{" "}
                    <strong className="text-textPrimary">
                      {subject.createdBy.fullName || subject.createdBy.username}
                    </strong>
                  </span>
                  <span className="text-borderPrimary">•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 opacity-60" />
                    <span>
                      {new Date(subject.createdAt).toLocaleDateString(
                        isArabic ? "ar-EG" : "en-US",
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── USER PROGRESS BAR CARD ───────────────────────────── */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-borderPrimary/60 mb-8 bg-linear-to-r from-primary/10 via-bgSecondary/80 to-bgSecondary shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/20 text-primary">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-textPrimary block">
                  {isArabic ? "نسبة إنجاز المادة الدراسية" : "Course Completion Progress"}
                </span>
                <span className="text-[11px] text-textSecondary">
                  {isArabic
                    ? "حدد العناصر التي أتممت دراستها لتتبع تقدمك الدراسي بدقة"
                    : "Mark lectures, summaries, and quizzes as completed to track study status"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-base font-black text-primary">
                {currentPercentage}%
              </span>
              <span className="text-xs text-textSecondary font-semibold">
                {isArabic ? "مكتمل" : "Completed"}
              </span>
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full h-2.5 bg-bgPrimary rounded-full overflow-hidden border border-borderPrimary/40">
            <div
              className="h-full bg-linear-to-r from-primary to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${currentPercentage}%` }}
            />
          </div>
        </div>

        {/* Subject Materials Tabs */}
        <div className="flex items-center gap-2 border-b border-borderPrimary/60 pb-3 mb-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("lectures")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === "lectures"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-textSecondary hover:text-textPrimary hover:bg-bgSecondary/60"
            }`}
          >
            <Video className="h-4 w-4" />
            <span>{isArabic ? "المحاضرات" : "Lectures"}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-black/15">
              {subject.lectures?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("summaries")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === "summaries"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-textSecondary hover:text-textPrimary hover:bg-bgSecondary/60"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>{isArabic ? "الملخصات" : "Summaries"}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-black/15">
              {subject.summaries?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("records")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === "records"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-textSecondary hover:text-textPrimary hover:bg-bgSecondary/60"
            }`}
          >
            <Mic className="h-4 w-4" />
            <span>{isArabic ? "التسجيلات الصوتية" : "Audio Records"}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-black/15">
              {subject.records?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("quizzes")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === "quizzes"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-textSecondary hover:text-textPrimary hover:bg-bgSecondary/60"
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>{isArabic ? "الاختبارات التفاعلية" : "Interactive Quizzes"}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-black/15">
              {subject.quizzes?.length || 0}
            </span>
          </button>
        </div>

        {/* ── TAB 1: LECTURES ───────────────────────────────────── */}
        {activeTab === "lectures" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Text as="h3" size="lg" font="bold" color="primary">
                {isArabic ? "محاضرات المادة" : "Subject Lectures"}
              </Text>
              {isAdminOrSuperAdmin && (
                <Button
                  onClick={() => setIsAddLectureOpen(true)}
                  className="rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isArabic ? "إضافة محاضرة" : "Add Lecture"}</span>
                </Button>
              )}
            </div>

            {subject.lectures?.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-bgSecondary/50 border border-borderPrimary/40">
                <Video className="h-10 w-10 mx-auto mb-2 text-textSecondary opacity-30" />
                <Text as="p" size="xs" color="secondary">
                  {isArabic
                    ? "لم يتم رفع أي محاضرات في هذه المادة بعد."
                    : "No lectures have been added to this subject yet."}
                </Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subject.lectures?.map((lecture, idx) => {
                  const isCompleted = progress?.completedLectures?.includes(lecture._id || "");

                  return (
                    <div
                      key={lecture._id || idx}
                      className={`p-5 rounded-2xl bg-bgSecondary/60 border transition-all flex flex-col justify-between ${
                        isCompleted
                          ? "border-emerald-500/40 bg-emerald-500/5"
                          : "border-borderPrimary/60 hover:border-primary/50"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleItem("lecture", lecture._id)}
                              title={isCompleted ? "Mark incomplete" : "Mark complete"}
                              className={`cursor-pointer transition-colors ${
                                isCompleted ? "text-emerald-500" : "text-textSecondary hover:text-emerald-500"
                              }`}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-primary/10 text-primary">
                              #{lecture.order ?? idx + 1}
                            </span>
                            <Link
                              href={`/subjects/${subjectId}/lectures/${lecture._id}`}
                              className="hover:underline"
                            >
                              <Text as="h4" size="sm" font="bold" color="primary">
                                {lecture.title}
                              </Text>
                            </Link>
                          </div>
                          {isAdminOrSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLecture(lecture._id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {lecture.description && (
                          <Text as="p" size="xs" color="secondary" className="line-clamp-2">
                            {lecture.description}
                          </Text>
                        )}
                      </div>

                      <div className="pt-3 border-t border-borderPrimary/40 flex items-center justify-between gap-2 flex-wrap">
                        <Link
                          href={`/subjects/${subjectId}/lectures/${lecture._id}`}
                          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                        >
                          <Play className="h-3.5 w-3.5 fill-primary" />
                          <span>{isArabic ? "فتح المحاضرة" : "View Lecture"}</span>
                          <ArrowIcon className="h-3 w-3" />
                        </Link>

                        {lecture.fileUrl && (
                          <a
                            href={lecture.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            download
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500 hover:underline"
                          >
                            <Download className="h-3 w-3" />
                            <span>PDF</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: SUMMARIES ──────────────────────────────────── */}
        {activeTab === "summaries" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Text as="h3" size="lg" font="bold" color="primary">
                {isArabic ? "ملخصات المادة الدراسية" : "Study Summaries"}
              </Text>
              {isAdminOrSuperAdmin && (
                <Button
                  onClick={() => setIsAddSummaryOpen(true)}
                  className="rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isArabic ? "إضافة ملخص" : "Add Summary"}</span>
                </Button>
              )}
            </div>

            {subject.summaries?.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-bgSecondary/50 border border-borderPrimary/40">
                <FileText className="h-10 w-10 mx-auto mb-2 text-textSecondary opacity-30" />
                <Text as="p" size="xs" color="secondary">
                  {isArabic
                    ? "لا توجد ملخصات دراسية مرفوعة حتى الآن."
                    : "No study summaries uploaded yet."}
                </Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subject.summaries?.map((summary, idx) => {
                  const isCompleted = progress?.completedSummaries?.includes(summary._id || "");

                  return (
                    <div
                      key={summary._id || idx}
                      className={`p-5 rounded-2xl bg-bgSecondary/60 border transition-all flex flex-col justify-between ${
                        isCompleted
                          ? "border-emerald-500/40 bg-emerald-500/5"
                          : "border-borderPrimary/60 hover:border-primary/50"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleItem("summary", summary._id)}
                              title={isCompleted ? "Mark incomplete" : "Mark complete"}
                              className={`cursor-pointer transition-colors ${
                                isCompleted ? "text-emerald-500" : "text-textSecondary hover:text-emerald-500"
                              }`}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div>
                              <Link
                                href={`/subjects/${subjectId}/summaries/${summary._id}`}
                                className="hover:underline"
                              >
                                <Text as="h4" size="sm" font="bold" color="primary">
                                  {summary.title}
                                </Text>
                              </Link>
                              <span className="text-[10px] text-textSecondary">
                                {new Date(summary.createdAt || Date.now()).toLocaleDateString(
                                  isArabic ? "ar-EG" : "en-US",
                                )}
                              </span>
                            </div>
                          </div>
                          {isAdminOrSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSummary(summary._id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {summary.description && (
                          <Text as="p" size="xs" color="secondary">
                            {summary.description}
                          </Text>
                        )}
                      </div>

                      <div className="pt-3 border-t border-borderPrimary/40 flex items-center justify-between gap-2">
                        <Link
                          href={`/subjects/${subjectId}/summaries/${summary._id}`}
                          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>{isArabic ? "قراءة الملخص" : "View Details"}</span>
                        </Link>

                        {summary.fileUrl && (
                          <a
                            href={summary.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            download
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>{isArabic ? "تحميل PDF" : "Download PDF"}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: RECORDS ────────────────────────────────────── */}
        {activeTab === "records" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Text as="h3" size="lg" font="bold" color="primary">
                {isArabic ? "التسجيلات الصوتية وشروحات الفويس" : "Audio Recordings & Voice Notes"}
              </Text>
              {isAdminOrSuperAdmin && (
                <Button
                  onClick={() => setIsAddRecordOpen(true)}
                  className="rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isArabic ? "إضافة تسجيل" : "Add Audio Record"}</span>
                </Button>
              )}
            </div>

            {subject.records?.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-bgSecondary/50 border border-borderPrimary/40">
                <Mic className="h-10 w-10 mx-auto mb-2 text-textSecondary opacity-30" />
                <Text as="p" size="xs" color="secondary">
                  {isArabic
                    ? "لا توجد تسجيلات صوتية متاحة حالياً."
                    : "No audio recordings available yet."}
                </Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subject.records?.map((record, idx) => {
                  const isCompleted = progress?.completedRecords?.includes(record._id || "");

                  return (
                    <div
                      key={record._id || idx}
                      className={`p-5 rounded-2xl bg-bgSecondary/60 border transition-all space-y-3 ${
                        isCompleted
                          ? "border-emerald-500/40 bg-emerald-500/5"
                          : "border-borderPrimary/60 hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleToggleItem("record", record._id)}
                            title={isCompleted ? "Mark incomplete" : "Mark complete"}
                            className={`cursor-pointer transition-colors ${
                              isCompleted ? "text-emerald-500" : "text-textSecondary hover:text-emerald-500"
                            }`}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                            <Mic className="h-5 w-5" />
                          </div>
                          <div>
                            <Text as="h4" size="sm" font="bold" color="primary">
                              {record.title}
                            </Text>
                            {record.duration && (
                              <span className="text-[10px] text-textSecondary font-semibold">
                                ⏱ {record.duration}
                              </span>
                            )}
                          </div>
                        </div>
                        {isAdminOrSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRecord(record._id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {record.description && (
                        <Text as="p" size="xs" color="secondary">
                          {record.description}
                        </Text>
                      )}

                      <div className="pt-2">
                        <audio controls className="w-full h-10 rounded-xl" src={record.audioUrl} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: QUIZZES ────────────────────────────────────── */}
        {activeTab === "quizzes" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Text as="h3" size="lg" font="bold" color="primary">
                {isArabic ? "الاختبارات التفاعلية" : "Interactive Quizzes"}
              </Text>
              {isAdminOrSuperAdmin && (
                <Button
                  onClick={() => setIsAddQuizOpen(true)}
                  className="rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isArabic ? "إضافة اختبار" : "Add Quiz"}</span>
                </Button>
              )}
            </div>

            {/* Active Quiz Runner View */}
            {activeQuiz ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-bgSecondary border border-primary/40 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-borderPrimary/60 pb-4">
                  <div>
                    <Text as="h3" size="xl" font="black" color="primary">
                      {activeQuiz.title}
                    </Text>
                    <div className="flex items-center gap-3 text-xs text-textSecondary mt-1">
                      <span>⏱ {activeQuiz.durationInMinutes} mins</span>
                      <span>•</span>
                      <span>{activeQuiz.questions?.length || 0} Questions</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveQuiz(null)}
                    className="rounded-xl text-xs"
                  >
                    {isArabic ? "خروج من الاختبار" : "Exit Quiz"}
                  </Button>
                </div>

                {/* Score Alert if Submitted */}
                {quizSubmitted ? (
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-primary/10 border border-primary/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          <Text as="h4" size="lg" font="bold" color="primary">
                            {isArabic ? "اكتمل الاختبار بنجاح!" : "Quiz Completed Successfully!"}
                          </Text>
                        </div>
                        <Text as="p" size="sm" color="secondary">
                          {isArabic
                            ? `النتيجة النهائية: ${calculateScore()} من ${activeQuiz.questions?.length} (${Math.round((calculateScore() / (activeQuiz.questions?.length || 1)) * 100)}%)`
                            : `Final Score: ${calculateScore()} of ${activeQuiz.questions?.length} (${Math.round((calculateScore() / (activeQuiz.questions?.length || 1)) * 100)}%)`}
                        </Text>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedAnswers({});
                          setQuizSubmitted(false);
                          setCurrentQuestionIndex(0);
                        }}
                        className="rounded-xl text-xs font-bold px-5"
                      >
                        {isArabic ? "إعادة الاختبار" : "Retake Quiz"}
                      </Button>
                    </div>

                    {/* Detailed Review of All Questions */}
                    <div className="space-y-4">
                      <Text as="h4" size="default" font="bold" color="primary">
                        {isArabic ? "مراجعة الأسئلة والإجابات النموذجية:" : "Question Review & Model Answers:"}
                      </Text>
                      {activeQuiz.questions?.map((q, qIdx) => {
                        const isCorrect = selectedAnswers[qIdx]?.trim() === q.correctAnswer.trim();
                        return (
                          <div
                            key={q._id || qIdx}
                            className={`p-5 rounded-2xl border transition-all ${
                              isCorrect
                                ? "bg-emerald-500/5 border-emerald-500/30"
                                : "bg-rose-500/5 border-rose-500/30"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <Text as="h5" size="sm" font="bold" color="primary">
                                {qIdx + 1}. {q.questionText}
                              </Text>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isCorrect
                                    ? "bg-emerald-500/20 text-emerald-500"
                                    : "bg-rose-500/20 text-rose-500"
                                }`}
                              >
                                {isCorrect
                                  ? isArabic
                                    ? "صحيحة"
                                    : "Correct"
                                  : isArabic
                                  ? "خاطئة"
                                  : "Incorrect"}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3">
                              {q.options?.map((opt, optIdx) => {
                                const isUserPick = selectedAnswers[qIdx] === opt;
                                const isAnswerKey = opt.trim() === q.correctAnswer.trim();

                                let optStyle = "border-borderPrimary bg-bgSecondary/60 text-textSecondary";
                                if (isAnswerKey) {
                                  optStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold";
                                } else if (isUserPick && !isCorrect) {
                                  optStyle = "border-rose-500 bg-rose-500/20 text-rose-600 dark:text-rose-400 line-through";
                                }

                                return (
                                  <div
                                    key={optIdx}
                                    className={`p-3 rounded-xl border text-xs text-left rtl:text-right flex items-center justify-between ${optStyle}`}
                                  >
                                    <span>{opt}</span>
                                    {isAnswerKey && (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {q.explanation && (
                              <div className="p-3 rounded-xl bg-bgPrimary/60 border border-borderPrimary/40 text-[11px] text-textSecondary">
                                <strong className="text-primary block mb-0.5">
                                  {isArabic ? "الشرح الطبي:" : "Clinical Explanation:"}
                                </strong>
                                <span>{q.explanation}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Step-by-Step Single Question Runner */
                  (() => {
                    const totalQuestions = activeQuiz.questions?.length || 0;
                    const currentQ = activeQuiz.questions?.[currentQuestionIndex];
                    const progressPercent = totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;
                    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

                    if (!currentQ) return null;

                    return (
                      <div className="space-y-6">
                        {/* Progress Header */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-primary font-bold">
                              {isArabic
                                ? `السؤال ${currentQuestionIndex + 1} من ${totalQuestions}`
                                : `Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
                            </span>
                            <span className="text-textSecondary bg-bgPrimary px-2.5 py-0.5 rounded-full border border-borderPrimary text-[11px]">
                              {progressPercent}%
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-bgPrimary rounded-full h-2.5 overflow-hidden border border-borderPrimary/50">
                            <div
                              className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>

                          {/* Question Navigator Pills */}
                          <div className="flex items-center gap-1.5 pt-2 flex-wrap">
                            {activeQuiz.questions?.map((_, idx) => {
                              const isCurrent = idx === currentQuestionIndex;
                              const isAnswered = selectedAnswers[idx] !== undefined;

                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setCurrentQuestionIndex(idx)}
                                  className={`h-7 w-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center border ${
                                    isCurrent
                                      ? "border-primary bg-primary text-primary-foreground shadow-sm scale-110"
                                      : isAnswered
                                      ? "border-primary/40 bg-primary/10 text-primary"
                                      : "border-borderPrimary bg-bgPrimary/60 text-textSecondary hover:border-primary/50"
                                  }`}
                                >
                                  {idx + 1}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Current Question Box */}
                        <div className="p-6 rounded-2xl bg-bgPrimary/70 border border-borderPrimary/60 space-y-4">
                          <div className="flex items-start gap-3">
                            <span className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary font-black text-xs shrink-0">
                              #{currentQuestionIndex + 1}
                            </span>
                            <Text as="h4" size="default" font="bold" color="primary" className="leading-snug">
                              {currentQ.questionText}
                            </Text>
                          </div>

                          {/* Options */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {currentQ.options?.map((opt, optIdx) => {
                              const isSelected = selectedAnswers[currentQuestionIndex] === opt;

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => handleSelectOption(currentQuestionIndex, opt)}
                                  className={`p-4 rounded-xl border text-xs text-left rtl:text-right transition-all cursor-pointer flex items-center justify-between ${
                                    isSelected
                                      ? "border-primary bg-primary/15 font-bold text-textPrimary shadow-xs ring-1 ring-primary"
                                      : "border-borderPrimary bg-bgSecondary/60 text-textSecondary hover:border-primary/60 hover:text-textPrimary"
                                  }`}
                                >
                                  <span>{opt}</span>
                                  <div
                                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                      isSelected
                                        ? "border-primary bg-primary"
                                        : "border-borderPrimary"
                                    }`}
                                  >
                                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Navigation Footer */}
                        <div className="flex items-center justify-between pt-2">
                          <Button
                            variant="outline"
                            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="rounded-xl text-xs font-bold gap-1.5 px-4 cursor-pointer"
                          >
                            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                            <span>{isArabic ? "السابق" : "Previous"}</span>
                          </Button>

                          {isLastQuestion ? (
                            <Button
                              onClick={() => {
                                setQuizSubmitted(true);
                                if (activeQuiz._id) {
                                  handleToggleItem("quiz", activeQuiz._id);
                                }
                              }}
                              className="rounded-xl text-xs font-bold px-6 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>{isArabic ? "تسليم الاختبار" : "Submit Quiz"}</span>
                            </Button>
                          ) : (
                            <Button
                              onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                              className="rounded-xl text-xs font-bold gap-1.5 px-5 cursor-pointer"
                            >
                              <span>{isArabic ? "التالي" : "Next"}</span>
                              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            ) : subject.quizzes?.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-bgSecondary/50 border border-borderPrimary/40">
                <HelpCircle className="h-10 w-10 mx-auto mb-2 text-textSecondary opacity-30" />
                <Text as="p" size="xs" color="secondary">
                  {isArabic
                    ? "لا توجد اختبارات تفاعلية في هذه المادة بعد."
                    : "No interactive quizzes added to this subject yet."}
                </Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subject.quizzes?.map((quiz, idx) => {
                  const isCompleted = progress?.completedQuizzes?.includes(quiz._id || "");

                  return (
                    <div
                      key={quiz._id || idx}
                      className={`p-5 rounded-2xl bg-bgSecondary/60 border transition-all space-y-3 flex flex-col justify-between ${
                        isCompleted
                          ? "border-emerald-500/40 bg-emerald-500/5"
                          : "border-borderPrimary/60 hover:border-primary/50"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleItem("quiz", quiz._id)}
                              title={isCompleted ? "Mark incomplete" : "Mark complete"}
                              className={`cursor-pointer transition-colors ${
                                isCompleted ? "text-emerald-500" : "text-textSecondary hover:text-emerald-500"
                              }`}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                              <HelpCircle className="h-4 w-4" />
                            </div>
                            <div>
                              <Text as="h4" size="sm" font="bold" color="primary">
                                {quiz.title}
                              </Text>
                              <span className="text-[10px] text-textSecondary">
                                ⏱ {quiz.durationInMinutes} mins • {quiz.questions?.length || 0} Questions
                              </span>
                            </div>
                          </div>
                          {isAdminOrSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuiz(quiz._id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {quiz.description && (
                          <Text as="p" size="xs" color="secondary">
                            {quiz.description}
                          </Text>
                        )}
                      </div>

                      <div className="pt-3 border-t border-borderPrimary/40 flex justify-end">
                        <Button
                          onClick={() => startQuiz(quiz)}
                          className="rounded-xl text-xs font-bold gap-2 cursor-pointer"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>{isArabic ? "بدء الاختبار" : "Start Quiz"}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Admin Content Modals */}
      {isAdminOrSuperAdmin && (
        <>
          <AddLectureModal
            isOpen={isAddLectureOpen}
            onClose={() => setIsAddLectureOpen(false)}
            subjectId={subjectId}
          />
          <AddSummaryModal
            isOpen={isAddSummaryOpen}
            onClose={() => setIsAddSummaryOpen(false)}
            subjectId={subjectId}
          />
          <AddRecordModal
            isOpen={isAddRecordOpen}
            onClose={() => setIsAddRecordOpen(false)}
            subjectId={subjectId}
          />
          <AddQuizModal
            isOpen={isAddQuizOpen}
            onClose={() => setIsAddQuizOpen(false)}
            subjectId={subjectId}
          />
        </>
      )}
    </div>
  );
}
