"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2, BookOpen, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/_components/Text";
import Error from "@/_components/Error";
import { toast } from "@/lib/toast";
import {
  CreateSubjectSchema,
  type ICreateSubjectInput,
} from "@/_features/subjects/schemas/subject";
import { useCreateSubject } from "@/_features/subjects/hooks";
import { useLanguage } from "@/context/LanguageContext";

interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateSubjectModal({
  isOpen,
  onClose,
}: CreateSubjectModalProps) {
  const { isArabic } = useLanguage();
  const createSubjectMutation = useCreateSubject();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ICreateSubjectInput>({
    resolver: zodResolver(CreateSubjectSchema as any),
    defaultValues: {
      title: "",
      description: "",
      code: "",
      department: "General Nursing",
    },
  });

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = (data: ICreateSubjectInput) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    if (data.code) formData.append("code", data.code);
    if (data.department) formData.append("department", data.department);
    if (selectedFile) formData.append("thumbnail", selectedFile);

    createSubjectMutation.mutate(formData, {
      onSuccess: () => {
        toast.success(
          isArabic
            ? "تم إنشاء المادة الدراسية بنجاح!"
            : "Subject created successfully!",
        );
        reset();
        setSelectedFile(null);
        setPreviewUrl(null);
        onClose();
      },
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message ||
            (isArabic
              ? "فشل إنشاء المادة الدراسية. حاول مرة أخرى."
              : "Failed to create subject. Please try again."),
        );
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-bgSecondary border border-borderPrimary rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-borderPrimary/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <Text as="h3" size="lg" font="bold" color="primary">
              {isArabic ? "إضافة مادة دراسية جديدة" : "Create New Subject"}
            </Text>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-textSecondary hover:text-textPrimary hover:bg-bgPrimary/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">
              {isArabic ? "اسم المادة الدراسية *" : "Subject Title *"}
            </Label>
            <Input
              id="title"
              placeholder={
                isArabic
                  ? "مثال: تمريض صحة البالغين"
                  : "e.g. Adult Health Nursing"
              }
              hasError={!!errors.title}
              {...register("title")}
            />
            <Error error={errors.title?.message} />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">
              {isArabic ? "وصف المادة الدراسية *" : "Description *"}
            </Label>
            <textarea
              id="description"
              rows={4}
              placeholder={
                isArabic
                  ? "نظرة عامة وشاملة عن محتوى ومنهج المادة الدراسية..."
                  : "Comprehensive curriculum overview and objectives..."
              }
              className="w-full px-4 py-2.5 rounded-xl bg-bgPrimary border border-borderPrimary text-textPrimary text-xs focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
              {...register("description")}
            />
            <Error error={errors.description?.message} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Code */}
            <div className="space-y-1.5">
              <Label htmlFor="code">
                {isArabic ? "كود المادة" : "Course Code"}
              </Label>
              <Input
                id="code"
                placeholder={isArabic ? "مثال: NUR-201" : "e.g. NUR-201"}
                hasError={!!errors.code}
                {...register("code")}
              />
              <Error error={errors.code?.message} />
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <Label htmlFor="department">
                {isArabic ? "القسم / التخصص" : "Department"}
              </Label>
              <Input
                id="department"
                placeholder={
                  isArabic
                    ? "مثال: تمريض باطني وجراحي"
                    : "e.g. Medical-Surgical Nursing"
                }
                hasError={!!errors.department}
                {...register("department")}
              />
              <Error error={errors.department?.message} />
            </div>
          </div>

          {/* Thumbnail Image */}
          <div className="space-y-2 pt-1">
            <Label>{isArabic ? "صورة الغلاف" : "Cover Thumbnail"}</Label>
            <div className="flex items-center gap-4">
              {previewUrl ? (
                <div className="relative h-20 w-32 rounded-xl overflow-hidden border border-borderPrimary shrink-0">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-black"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="h-20 w-32 rounded-xl border-2 border-dashed border-borderPrimary/70 hover:border-primary/60 flex flex-col items-center justify-center cursor-pointer transition-colors shrink-0 bg-bgPrimary/40">
                  <ImageIcon className="h-6 w-6 text-textSecondary mb-1" />
                  <span className="text-[10px] text-textSecondary font-medium">
                    {isArabic ? "اختر صورة" : "Upload Image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
              <Text as="p" size="xs" color="secondary" className="leading-relaxed">
                {isArabic
                  ? "ارفع صورة واضحة ومميزة تعبر عن محتوى المادة التمريضية."
                  : "Upload a clean banner image representing this nursing subject."}
              </Text>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-borderPrimary/60">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createSubjectMutation.isPending}
              className="rounded-xl text-xs font-semibold"
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={createSubjectMutation.isPending}
              className="rounded-xl text-xs font-semibold gap-2"
            >
              {createSubjectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    {isArabic ? "جاري الإنشاء..." : "Creating..."}
                  </span>
                </>
              ) : (
                <span>
                  {isArabic ? "إنشاء المادة" : "Create Subject"}
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
