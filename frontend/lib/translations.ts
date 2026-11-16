export type Language = "en" | "ar";

import { navTranslations, NavTranslations } from "@/_components/nav.translations";
import { homeTranslations, HomeTranslations } from "@/app/home.translations";
import {
  subjectTranslations,
  SubjectTranslations,
} from "@/app/subjects/translations";
import { profileTranslations, ProfileTranslations } from "@/app/profile/translations";
import { adminTranslations, AdminTranslations } from "@/app/admin/translations";
import { authTranslations, AuthTranslations } from "@/app/auth/translations";
import {
  chatTranslations,
  ChatTranslations,
} from "@/app/chat/translations";
import { storyTranslations, StoryTranslations } from "@/app/stories/translations";
import {
  leaderboardTranslations,
  LeaderboardTranslations,
} from "@/app/leaderboard/translations";

export interface TranslationSchema {
  nav: NavTranslations;
  home: HomeTranslations;
  subject: SubjectTranslations;
  post: Record<string, string>;
  createEditPost: Record<string, string>;
  profile: ProfileTranslations;
  admin: AdminTranslations;
  auth: AuthTranslations;
  chat: ChatTranslations;
  story: StoryTranslations;
  leaderboard: LeaderboardTranslations;
}

const fallbackPostEn = {
  cancel: "Cancel",
  saving: "Saving...",
  backToFeed: "Back to Subjects",
  savePost: "Save",
  deletePost: "Delete",
};

const fallbackPostAr = {
  cancel: "إلغاء",
  saving: "جاري الحفظ...",
  backToFeed: "الرجوع للمواد",
  savePost: "حفظ",
  deletePost: "حذف",
};

export const translations: Record<Language, TranslationSchema> = {
  en: {
    nav: navTranslations.en,
    home: homeTranslations.en,
    subject: subjectTranslations.en,
    post: fallbackPostEn,
    createEditPost: fallbackPostEn,
    profile: profileTranslations.en,
    admin: adminTranslations.en,
    auth: authTranslations.en,
    chat: chatTranslations.en,
    story: storyTranslations.en,
    leaderboard: leaderboardTranslations.en,
  },
  ar: {
    nav: navTranslations.ar,
    home: homeTranslations.ar,
    subject: subjectTranslations.ar,
    post: fallbackPostAr,
    createEditPost: fallbackPostAr,
    profile: profileTranslations.ar,
    admin: adminTranslations.ar,
    auth: authTranslations.ar,
    chat: chatTranslations.ar,
    story: storyTranslations.ar,
    leaderboard: leaderboardTranslations.ar,
  },
};
