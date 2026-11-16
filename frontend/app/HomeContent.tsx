"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/_components/Navbar";
import UserProfileSidebar from "@/_components/UserProfileSidebar";
import { Text } from "@/_components/Text";
import { Button } from "@/components/ui/button";
import { useGetSubjects } from "@/_features/subjects/hooks";
import { useGetAuthMeQuery } from "@/_features/auth/hooks";
import {
  BookOpen,
  Search,
  Plus,
  Video,
  FileText,
  Mic,
  HelpCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import CreateSubjectModal from "@/_components/CreateSubjectModal";
import { useLanguage } from "@/context/LanguageContext";

const DEPARTMENTS = [
  "All",
  "General Nursing",
  "Medical-Surgical",
  "Critical Care",
  "Pediatric Nursing",
  "Maternal & Child Health",
  "Mental Health",
  "Community Health",
];

export default function HomeContent() {
  const { isArabic } = useLanguage();
  const { data: currentUser } = useGetAuthMeQuery();

  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: subjectsData, isLoading } = useGetSubjects({
    search: search || undefined,
    department: selectedDept !== "All" ? selectedDept : undefined,
  });

  const subjects = subjectsData?.subjects || [];
  const isAdminOrSuperAdmin =
    currentUser?.role === "admin" || currentUser?.role === "superadmin";

  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-bgPrimary text-textPrimary flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Subjects Feed / Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Platform Welcome Banner */}
            <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-linear-to-r from-primary/15 via-primary/5 to-transparent border border-primary/20 shadow-md">
              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                  <GraduationCap className="h-4 w-4" />
                  <span>
                    {isArabic
                      ? "المنصة التعليمية لطلاب التمريض"
                      : "Nursing Education Platform"}
                  </span>
                </div>

                <Text as="h1" size="2xl" font="black" color="primary" className="leading-tight sm:text-3xl">
                  {isArabic ? "مرحباً بك في منصة Nursify" : "Welcome to Nursify"}
                </Text>

                <Text as="p" size="xs" color="secondary" className="leading-relaxed max-w-xl">
                  {isArabic
                    ? "منصتك المتكاملة لدراسة التمريض: محاضرات فيديو، ملخصات دراسية PDF، تسجيلات صوتية، واختبارات تفاعلية."
                    : "Your all-in-one hub for nursing students: clinical lectures, downloadable study summaries, audio records, and interactive quizzes."}
                </Text>

                {isAdminOrSuperAdmin && (
                  <div className="pt-2">
                    <Button
                      onClick={() => setIsCreateOpen(true)}
                      className="rounded-xl text-xs font-bold gap-2 cursor-pointer shadow-md"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{isArabic ? "إضافة مادة دراسية جديدة" : "Add Subject"}</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Search & Department Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary" />
                <input
                  type="text"
                  placeholder={
                    isArabic
                      ? "ابحث باسم المادة، الكود، أو القسم..."
                      : "Search by subject title, course code, or department..."
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 py-2.5 text-xs rounded-xl bg-bgSecondary border border-borderPrimary text-textPrimary outline-none focus:ring-2 focus:ring-primary shadow-xs"
                />
              </div>

              {/* Department Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {DEPARTMENTS.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDept(dept)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedDept === dept
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-bgSecondary/80 text-textSecondary hover:text-textPrimary hover:bg-bgSecondary border border-borderPrimary/60"
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Subjects Grid */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : subjects.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-bgSecondary/40 border border-borderPrimary/60">
                <BookOpen className="h-10 w-10 mx-auto mb-2 text-textSecondary opacity-30" />
                <Text as="h3" size="default" font="bold" color="primary" className="mb-1">
                  {isArabic ? "لم نجد أي مادة دراسية" : "No Subjects Found"}
                </Text>
                <Text as="p" size="xs" color="secondary">
                  {isArabic
                    ? "جرب البحث بكلمات أخرى أو اختر قسماً آخر."
                    : "Try searching with different keywords or select another department."}
                </Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjects.map((sub) => (
                  <Link
                    key={sub._id}
                    href={`/subjects/${sub._id}`}
                    className="group glass-card rounded-2xl overflow-hidden border border-borderPrimary/60 hover:border-primary/60 transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      {/* Cover */}
                      {sub.thumbnail?.url ? (
                        <div className="h-36 w-full overflow-hidden relative">
                          <img
                            src={sub.thumbnail.url}
                            alt={sub.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {sub.code && (
                            <span className="absolute top-2.5 ltr:left-2.5 rtl:right-2.5 px-2 py-0.5 rounded-lg text-[10px] font-black bg-black/70 text-white backdrop-blur-xs">
                              {sub.code}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="h-36 w-full bg-primary/10 flex flex-col items-center justify-center text-primary relative">
                          <BookOpen className="h-10 w-10 opacity-60 mb-1" />
                          {sub.code && (
                            <span className="text-[11px] font-black uppercase tracking-wider">
                              {sub.code}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Info */}
                      <div className="p-4 space-y-2">
                        <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                          {sub.department || "General"}
                        </span>
                        <Text as="h3" size="sm" font="bold" color="primary" className="group-hover:text-primary transition-colors line-clamp-1">
                          {sub.title}
                        </Text>
                        <Text as="p" size="xs" color="secondary" className="line-clamp-2 leading-relaxed">
                          {sub.description}
                        </Text>
                      </div>
                    </div>

                    {/* Materials Counts */}
                    <div className="px-4 py-3 border-t border-borderPrimary/40 bg-bgSecondary/30 flex items-center justify-between text-[11px] text-textSecondary">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center gap-1" title="Lectures">
                          <Video className="h-3 w-3 text-primary" />
                          {sub.lectures?.length || 0}
                        </span>
                        <span className="flex items-center gap-1" title="Summaries">
                          <FileText className="h-3 w-3 text-blue-500" />
                          {sub.summaries?.length || 0}
                        </span>
                        <span className="flex items-center gap-1" title="Audio Records">
                          <Mic className="h-3 w-3 text-amber-500" />
                          {sub.records?.length || 0}
                        </span>
                        <span className="flex items-center gap-1" title="Quizzes">
                          <HelpCircle className="h-3 w-3 text-purple-500" />
                          {sub.quizzes?.length || 0}
                        </span>
                      </div>

                      <span className="flex items-center gap-1 text-primary font-bold group-hover:translate-x-1 transition-transform">
                        <span>{isArabic ? "دخول" : "Enter"}</span>
                        <ArrowIcon className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar: User Profile Overview */}
          <div className="lg:col-span-4 space-y-6">
            <UserProfileSidebar />
          </div>
        </div>
      </main>

      {/* Create Subject Modal */}
      {isAdminOrSuperAdmin && (
        <CreateSubjectModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      )}
    </div>
  );
}
