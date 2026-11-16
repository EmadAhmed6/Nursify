"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/_components/Navbar";
import AdminSidebar from "@/_components/AdminSidebar";
import { Text } from "@/_components/Text";
import { useGetAllUsers } from "@/_features/user/hooks";
import { useGetSubjects, useDeleteSubject } from "@/_features/subjects/hooks";
import { useGetAuthMeQuery } from "@/_features/auth/hooks";
import {
  BookOpen,
  Plus,
  Trash2,
  Loader2,
  Search,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Video,
  FileText,
  Mic,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DeleteConfirmModal from "@/_components/DeleteConfirmModal";
import CreateSubjectModal from "@/_components/CreateSubjectModal";
import Tooltip from "@/_components/Tooltip";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "@/lib/toast";

export default function AdminSubjectsPage() {
  const { data: currentUser, isLoading: isAuthLoading } = useGetAuthMeQuery();
  const { data: users } = useGetAllUsers();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSubjectToDelete, setSelectedSubjectToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPageNumber(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: subjectsData, isLoading: isSubjectsLoading } = useGetSubjects({
    search: debouncedSearch || undefined,
    department: departmentFilter !== "All" ? departmentFilter : undefined,
    pageNumber,
  });

  const deleteSubjectMutation = useDeleteSubject();
  const { isArabic } = useLanguage();

  if (!mounted || isAuthLoading) {
    return (
      <div className="min-h-screen bg-bgPrimary text-textPrimary flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const BackIcon = isArabic ? ArrowRight : ArrowLeft;
  const NextIcon = isArabic ? ArrowLeft : ArrowRight;

  if (currentUser?.role !== "admin" && currentUser?.role !== "superadmin") {
    return (
      <div className="min-h-screen bg-bgPrimary text-textPrimary flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <Text as="h1" size="2xl" font="extraBold" color="primary" className="mb-2">
            {isArabic ? "غير مسموح بالدخول" : "Access Denied"}
          </Text>
          <Text as="p" size="xs" color="secondary" className="mb-6 leading-relaxed">
            {isArabic
              ? "معندكش صلاحيات أدمن عشان تدخل لوحة التحكم."
              : "You do not have administrative privileges to access this page."}
          </Text>
          <Link href="/">
            <Button className="rounded-xl text-xs font-semibold cursor-pointer">
              {isArabic ? "الرجوع للرئيسية" : "Back to Home"}
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const allSubjectsList = subjectsData?.subjects || [];
  const totalUsers = users?.totalUsers ?? (Array.isArray(users) ? users.length : users?.users?.length ?? 0);
  const totalSubjects = subjectsData?.totalSubjects ?? allSubjectsList.length;
  const currentPage = subjectsData?.page || pageNumber;
  const totalPages = subjectsData?.pages || 1;

  const handleConfirmDelete = async () => {
    if (!selectedSubjectToDelete) return;
    try {
      await deleteSubjectMutation.mutateAsync(selectedSubjectToDelete.id);
      toast.success(isArabic ? "تم حذف المادة بنجاح!" : "Subject deleted successfully!");
      setSelectedSubjectToDelete(null);
    } catch {
      // handled by mutation
    }
  };

  return (
    <div className="min-h-screen bg-bgPrimary text-textPrimary flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header Breadcrumbs / Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-textSecondary mb-1.5 font-medium">
              <Link href="/" className="hover:text-primary transition-colors">
                {isArabic ? "الرئيسية" : "Home"}
              </Link>
              <span>/</span>
              <span>{isArabic ? "لوحة التحكم" : "Dashboard"}</span>
              <span>/</span>
              <span className="text-primary">{isArabic ? "إدارة المواد الدراسية" : "Subjects Management"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Text as="h1" size="2xl" font="black" color="primary">
                {isArabic ? "إدارة المواد التمريضية" : "Nursing Subjects Management"}
              </Text>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {totalSubjects} {isArabic ? "مادة" : "Subjects"}
              </span>
            </div>
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-xl text-xs font-bold gap-2 cursor-pointer shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>{isArabic ? "إضافة مادة جديدة" : "Create New Subject"}</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <AdminSidebar
              currentUser={currentUser}
              totalUsers={totalUsers}
              totalPosts={totalSubjects}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-6">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary" />
                <input
                  type="text"
                  placeholder={
                    isArabic
                      ? "ابحث باسم المادة، الكود، أو القسم..."
                      : "Search subjects, code, or department..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 py-2.5 text-xs rounded-xl bg-bgSecondary border border-borderPrimary text-textPrimary outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Subjects Table */}
            <div className="rounded-2xl bg-bgSecondary/50 border border-borderPrimary/50 overflow-hidden shadow-lg">
              {isSubjectsLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : allSubjectsList.length === 0 ? (
                <div className="py-16 text-center">
                  <BookOpen className="h-10 w-10 mx-auto mb-2 text-textSecondary opacity-30" />
                  <Text as="p" size="xs" color="secondary">
                    {isArabic
                      ? "لم يتم العثور على أي مواد مطابقة."
                      : "No subjects found matching your query."}
                  </Text>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full ltr:text-left rtl:text-right text-xs">
                    <thead className="bg-bgSecondary/90 text-textSecondary font-semibold uppercase tracking-wider border-b border-borderPrimary/40">
                      <tr>
                        <th className="px-6 py-4">{isArabic ? "المادة" : "Subject"}</th>
                        <th className="px-6 py-4">{isArabic ? "الكود" : "Code"}</th>
                        <th className="px-6 py-4">{isArabic ? "القسم" : "Department"}</th>
                        <th className="px-6 py-4">{isArabic ? "المحتويات" : "Contents"}</th>
                        <th className="px-6 py-4 ltr:text-right rtl:text-left">
                          {isArabic ? "الإجراءات" : "Actions"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borderPrimary/30 text-textPrimary font-medium">
                      {allSubjectsList.map((sub) => (
                        <tr key={sub._id} className="hover:bg-bgSecondary/80 transition-colors">
                          <td className="px-6 py-4">
                            <Link
                              href={`/subjects/${sub._id}`}
                              className="flex items-center gap-3 group"
                            >
                              {sub.thumbnail?.url ? (
                                <img
                                  src={sub.thumbnail.url}
                                  alt={sub.title}
                                  className="h-10 w-14 rounded-lg object-cover border border-borderPrimary group-hover:border-primary transition-colors shrink-0"
                                />
                              ) : (
                                <div className="h-10 w-14 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                  <BookOpen className="h-5 w-5" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <Text
                                  as="h4"
                                  size="xs"
                                  font="bold"
                                  color="primary"
                                  className="group-hover:text-primary transition-colors truncate max-w-xs"
                                >
                                  {sub.title}
                                </Text>
                                <span className="text-[10px] text-textSecondary line-clamp-1">
                                  {sub.description}
                                </span>
                              </div>
                            </Link>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-primary/10 text-primary">
                              {sub.code || "—"}
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-textSecondary">
                            {sub.department || "General"}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3 text-[11px] text-textSecondary">
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
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap ltr:text-right rtl:text-left">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/subjects/${sub._id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-xl hover:border-primary hover:text-primary transition-all cursor-pointer"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  setSelectedSubjectToDelete({
                                    id: sub._id,
                                    title: sub.title,
                                  })
                                }
                                className="h-8 w-8 p-0 rounded-xl bg-rose-500/15 text-rose-500 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-borderPrimary/40 flex items-center justify-between bg-bgSecondary/30">
                  <Text as="p" size="xs" color="secondary">
                    {isArabic
                      ? `صفحة ${currentPage} من ${totalPages}`
                      : `Page ${currentPage} of ${totalPages}`}
                  </Text>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="rounded-xl text-xs"
                    >
                      <BackIcon className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="rounded-xl text-xs"
                    >
                      <NextIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Subject Confirmation Modal */}
      {selectedSubjectToDelete && (
        <DeleteConfirmModal
          isOpen={!!selectedSubjectToDelete}
          onClose={() => setSelectedSubjectToDelete(null)}
          onConfirm={handleConfirmDelete}
          title={isArabic ? "حذف المادة الدراسية" : "Delete Subject"}
          description={
            isArabic
              ? `هل أنت متأكد من حذف المادة "${selectedSubjectToDelete.title}"؟ سيتم حذف جميع المحاضرات والملخصات والاختبارات التابعة لها.`
              : `Are you sure you want to delete "${selectedSubjectToDelete.title}"? All lectures, summaries, and quizzes will be deleted permanently.`
          }
          isPending={deleteSubjectMutation.isPending}
        />
      )}

      {/* Create Subject Modal */}
      <CreateSubjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
