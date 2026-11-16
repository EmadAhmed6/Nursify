import type { Language } from "@/lib/translations";

export interface LeaderboardTranslations {
  title: string;
  subtitle: string;
  rank: string;
  points: string;
  pts: string;
  yourRank: string;
  topStudents: string;
  noData: string;
  questionOf: string;
  loading: string;
}

export const leaderboardTranslations: Record<Language, LeaderboardTranslations> = {
  en: {
    title: "Leaderboard",
    subtitle: "Top Ranked Students",
    rank: "Rank",
    points: "Points",
    pts: "pts",
    yourRank: "Your Rank",
    topStudents: "Top Students",
    noData: "No leaderboard data available yet",
    questionOf: "of",
    loading: "Loading leaderboard...",
  },
  ar: {
    title: "المتصدرين",
    subtitle: "أعلى الطلاب ترتيباً",
    rank: "الترتيب",
    points: "النقاط",
    pts: "نقطة",
    yourRank: "ترتيبك",
    topStudents: "أفضل الطلاب",
    noData: "مفيش بيانات للمتصدرين لسه",
    questionOf: "من",
    loading: "جاري تحميل المتصدرين...",
  },
};
