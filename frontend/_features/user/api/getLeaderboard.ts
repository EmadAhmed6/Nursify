import { axiosClient } from "@/lib/axiosClient";
import type { LeaderboardResponse } from "../types/leaderboard.types";

export const getLeaderboard = async (): Promise<LeaderboardResponse> => {
  const res = await axiosClient.get("/users/leaderboard");
  return res.data?.data;
};
