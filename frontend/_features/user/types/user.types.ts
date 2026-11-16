import type { Story } from "@/_features/stories/types/story.types";

export type UserRole = "student" | "admin" | "superadmin";
export type UserProvider = "local" | "google";

export interface UserProfile {
  _id: string;
  fullName?: string;
  username: string;
  jobTitle?: string;
  email?: string;
  role?: UserRole;
  provider?: UserProvider;
  isVerified?: boolean;
  subjectsCount?: number;
  profilePicture?: {
    url?: string;
    publicId?: string;
  };
  bio?: string;
  followers?: string[] | any[];
  following?: string[] | any[];
  createdAt?: string;
  updatedAt?: string;
  stories?: Story[];
  hasActivityStory?: boolean;
}
