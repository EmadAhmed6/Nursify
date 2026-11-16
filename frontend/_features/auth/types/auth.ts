export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  data?: any;
}

export interface ForgotPasswordData {
  email: string;
}

export type UserRole = "student" | "admin" | "superadmin";
export type UserProvider = "local" | "google";

export interface AuthMe {
  _id: string;
  fullName?: string;
  username: string;
  jobTitle?: string;
  email: string;
  isVerified?: boolean;
  subjectsCount: number;
  profilePicture: {
    url: string;
    publicId: string;
  };
  role: UserRole;
  provider?: UserProvider;
  followers?: string[];
  following?: string[];
  blockUsers?: string[];
  blockedByUsers?: string[];
  createdAt: string;
  updatedAt: string;
}
