import { axiosClient } from "@/lib/axiosClient";
import { UserProfile } from "../types/user.types";

export const getUserById = async (userId: string): Promise<UserProfile> => {
  const response = await axiosClient.get<any>(`/users/${userId}`);
  return response.data?.data || response.data?.user || response.data;
};
