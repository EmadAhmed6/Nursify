import { z } from "zod";

export const editProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full Name is required")
    .min(3, "Full Name must be at least 3 characters")
    .max(100, "Full Name must not exceed 100 characters"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters"),
  jobTitle: z
    .string()
    .trim()
    .max(50, "Job title must not exceed 50 characters")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(250, "Bio must not exceed 250 characters")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().email("Invalid email address"),
});

export type IEditProfile = z.infer<typeof editProfileSchema>;
