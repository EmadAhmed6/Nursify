export interface LeaderboardUser {
  _id: string;
  fullName?: string;
  username: string;
  profilePicture?: { url?: string; publicId?: string | null };
  jobTitle?: string;
  points: number;
  rank?: number;
}

export interface LeaderboardResponse {
  top10: LeaderboardUser[];
  currentUser: LeaderboardUser | null;
}
