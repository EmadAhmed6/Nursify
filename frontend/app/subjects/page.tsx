"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/_components/Navbar";
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

export default function SubjectsPage() {
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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Banner Section */}
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-linear-to-r from-primary/15 via-primary/5 to-transparent border border-primary/20 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                {isArabic
                  ? "المنصة التعليمية لطلاب التمريض"
                  : "Educational Platform for Nursing Students"}
              </span>
            </div>

            <Text as="h1" size="3xl" font="black" color="primary" className="leading-tight sm:text-4xl">
              {isArabic ? "المواد والمقررات التمريضية" : "Nursing Subjects & Courses"}
            </Text>

            <Text as="p" size="sm" color="secondary" className="leading-relaxed">
              {isArabic
                ? "تصفح المحاضرات العلمية، حمل ملخصات المذاكرة، استمع للتسجيلات الصوتية، واختبر معلوماتك بالاختبارات التفاعلية."
                : "Explore medical lectures, download study summaries, listen to audio records, and practice interactive clinical quizzes."}
            </Text>

            {isAdminOrSuperAdmin && (
              <div className="pt-2">
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="rounded-xl text-xs font-bold gap-2 cursor-pointer shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isArabic ? "إضافة مادة دراسية جديدة" : "Add New Subject"}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Search & Department Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
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

            {/* Total Count */}
            <div className="text-xs text-textSecondary font-semibold">
              {isArabic
                ? `إجمالي المواد: ${subjectsData?.totalSubjects || subjects.length}`
                : `Total Subjects: ${subjectsData?.totalSubjects || subjects.length}`}
            </div>
          </div>

          {/* Department Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedDept === dept
                    ? "bg-primary text-primary-foreground shadow-sm"
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
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : subjects.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-bgSecondary/40 border border-borderPrimary/60">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-textSecondary opacity-30" />
            <Text as="h3" size="default" font="bold" color="primary" className="mb-1">
              {isArabic ? "لم نجد أي مادة دراسية" : "No Subjects Found"}
            </Text>
            <Text as="p" size="xs" color="secondary">
              {isArabic
                ? "حاول تغيير كلمات البحث أو اختر قسماً آخر."
                : "Try adjusting your search criteria or filter by another department."}
            </Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((sub) => (
              <Link
                key={sub._id}
                href={`/subjects/${sub._id}`}
                className="group glass-card rounded-3xl overflow-hidden border border-borderPrimary/60 hover:border-primary/60 transition-all duration-300 hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Cover */}
                  {sub.thumbnail?.url ? (
                    <div className="h-44 w-full overflow-hidden relative">
                      <img
                        src={sub.thumbnail.url}
                        alt={sub.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {sub.code && (
                        <span className="absolute top-3 ltr:left-3 rtl:right-3 px-2.5 py-1 rounded-xl text-[10px] font-black bg-black/70 text-white backdrop-blur-xs">
                          {sub.code}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="h-44 w-full bg-primary/10 flex flex-col items-center justify-center text-primary relative">
                      <BookOpen className="h-12 w-12 opacity-60 mb-1" />
                      {sub.code && (
                        <span className="text-xs font-black uppercase tracking-wider">
                          {sub.code}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                        {sub.department || "General"}
                      </span>
                    </div>

                    <Text as="h3" size="default" font="bold" color="primary" className="group-hover:text-primary transition-colors line-clamp-1">
                      {sub.title}
                    </Text>

                    <Text as="p" size="xs" color="secondary" className="line-clamp-2 leading-relaxed">
                      {sub.description}
                    </Text>
                  </div>
                </div>

                {/* Footer Counts */}
                <div className="px-5 py-4 border-t border-borderPrimary/40 bg-bgSecondary/30 flex items-center justify-between text-[11px] text-textSecondary">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1" title="Lectures">
                      <Video className="h-3.5 w-3.5 text-primary" />
                      {sub.lectures?.length || 0}
                    </span>
                    <span className="flex items-center gap-1" title="Summaries">
                      <FileText className="h-3.5 w-3.5 text-blue-500" />
                      {sub.summaries?.length || 0}
                    </span>
                    <span className="flex items-center gap-1" title="Audio Records">
                      <Mic className="h-3.5 w-3.5 text-amber-500" />
                      {sub.records?.length || 0}
                    </span>
                    <span className="flex items-center gap-1" title="Quizzes">
                      <HelpCircle className="h-3.5 w-3.5 text-purple-500" />
                      {sub.quizzes?.length || 0}
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-primary font-bold group-hover:translate-x-1 transition-transform">
                    <span>{isArabic ? "استكشاف" : "Explore"}</span>
                    <ArrowIcon className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
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
