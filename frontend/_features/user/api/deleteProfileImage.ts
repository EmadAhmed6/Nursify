import { axiosClient } from "@/lib/axiosClient";
import { UserProfile } from "../types/user.types";

export const deleteProfileImage = async (
  userId: string,
): Promise<UserProfile> => {
  const response = await axiosClient.delete<any>(`/users/${userId}/profile-image`);
  return response.data?.data || response.data?.user || response.data;
};
