import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "../api/getLeaderboard";

export const useLeaderboard = () =>
  useQuery({
    queryKey: ["leaderboard"],
    queryFn: getLeaderboard,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
