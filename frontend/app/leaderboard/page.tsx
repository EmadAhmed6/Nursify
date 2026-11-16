"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Medal, Crown, Star, User as UserIcon, ArrowLeft } from "lucide-react";
import { useLeaderboard } from "@/_features/user/hooks";
import { useLanguage } from "@/context/LanguageContext";
import { Text } from "@/_components/Text";
import type { LeaderboardUser } from "@/_features/user/types/leaderboard.types";

// ─── Skeleton Loaders ───────────────────────────────────
function PodiumSkeleton() {
  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6 py-8">
      {[120, 144, 112].map((h, i) => (
        <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-bgSecondary/80 border-2 border-borderPrimary/30" />
          <div className="h-3 w-16 bg-bgSecondary/80 rounded" />
          <div
            className="w-20 sm:w-24 rounded-t-xl bg-bgSecondary/60"
            style={{ height: h }}
          />
        </div>
      ))}
    </div>
  );
}

function RankRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="w-7 h-7 rounded-full bg-bgSecondary/80" />
      <div className="w-9 h-9 rounded-full bg-bgSecondary/80" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-28 bg-bgSecondary/80 rounded" />
        <div className="h-2.5 w-16 bg-bgSecondary/60 rounded" />
      </div>
      <div className="h-4 w-12 bg-bgSecondary/80 rounded" />
    </div>
  );
}

// ─── Avatar Helper ──────────────────────────────────────
function UserAvatar({
  user,
  size = "md",
}: {
  user: LeaderboardUser;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-9 w-9",
    md: "h-12 w-12",
    lg: "h-16 w-16 sm:h-20 sm:w-20",
  };

  return user.profilePicture?.url ? (
    <img
      src={user.profilePicture.url}
      alt={user.fullName || user.username}
      referrerPolicy="no-referrer"
      className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-primary/20`}
    />
  ) : (
    <div
      className={`${sizeClasses[size]} rounded-full bg-primary/10 flex items-center justify-center text-primary ring-2 ring-primary/20`}
    >
      <UserIcon className={size === "lg" ? "h-8 w-8" : size === "md" ? "h-5 w-5" : "h-4 w-4"} />
    </div>
  );
}

// ─── Podium (Top 3) ─────────────────────────────────────
function Podium({ users, isArabic }: { users: LeaderboardUser[]; isArabic: boolean }) {
  if (users.length === 0) return null;

  // Order: 2nd, 1st, 3rd for visual podium
  const podiumOrder = [users[1], users[0], users[2]].filter(Boolean) as LeaderboardUser[];

  const rankMeta = [
    {
      icon: <Medal className="h-5 w-5 text-slate-400" />,
      bg: "from-slate-500/10 to-slate-500/5",
      border: "border-slate-400/30",
      height: "h-24 sm:h-28",
      label: "2",
      ring: "ring-slate-400/40",
    },
    {
      icon: <Crown className="h-6 w-6 text-amber-400" />,
      bg: "from-amber-500/15 to-amber-500/5",
      border: "border-amber-400/40",
      height: "h-32 sm:h-36",
      label: "1",
      ring: "ring-amber-400/50",
    },
    {
      icon: <Medal className="h-5 w-5 text-amber-700" />,
      bg: "from-amber-800/10 to-amber-800/5",
      border: "border-amber-700/30",
      height: "h-20 sm:h-24",
      label: "3",
      ring: "ring-amber-700/40",
    },
  ];

  return (
    <div className="flex items-end justify-center gap-2 sm:gap-5 pt-6 pb-4">
      {podiumOrder.map((user, idx) => {
        const meta = rankMeta[idx];
        const actualRank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
        return (
          <Link
            key={user._id}
            href={`/profile/${user._id}`}
            className="flex flex-col items-center group"
          >
            {/* Rank Badge + Icon */}
            <div className="relative mb-2">
              {meta.icon}
            </div>

            {/* Avatar */}
            <div className={`relative mb-2 ring-4 ${meta.ring} rounded-full`}>
              <UserAvatar user={user} size={idx === 1 ? "lg" : "md"} />
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-lg">
                #{actualRank}
              </span>
            </div>

            {/* Name */}
            <Text
              as="span"
              size="xs"
              font="bold"
              color="primary"
              className="text-center truncate max-w-20 sm:max-w-28 group-hover:text-primary transition-colors"
            >
              {user.fullName || user.username}
            </Text>

            {/* Points */}
            <Text
              as="span"
              size="xs"
              color="secondary"
              className="text-[10px] font-semibold"
            >
              {(user.points ?? 0).toLocaleString()} {isArabic ? "نقطة" : "pts"}
            </Text>

            {/* Podium Block */}
            <div
              className={`${meta.height} w-20 sm:w-28 mt-2 rounded-t-2xl bg-gradient-to-t ${meta.bg} border ${meta.border} border-b-0 flex items-center justify-center`}
            >
              <Star className="h-5 w-5 text-primary/20" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─── Rank Row (4-10) ────────────────────────────────────
function RankRow({
  user,
  rank,
  isArabic,
}: {
  user: LeaderboardUser;
  rank: number;
  isArabic: boolean;
}) {
  return (
    <Link
      href={`/profile/${user._id}`}
      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bgSecondary/60 transition-colors group"
    >
      {/* Rank Badge */}
      <div className="w-7 h-7 rounded-full bg-bgSecondary flex items-center justify-center border border-borderPrimary/40 shrink-0">
        <Text as="span" size="xs" font="extraBold" color="secondary">
          {rank}
        </Text>
      </div>

      {/* Avatar */}
      <UserAvatar user={user} size="sm" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Text
          as="p"
          size="xs"
          font="bold"
          color="primary"
          className="truncate group-hover:text-primary transition-colors"
        >
          {user.fullName || user.username}
        </Text>
        <Text as="p" size="xs" color="secondary" className="text-[10px] truncate">
          @{user.username}
        </Text>
      </div>

      {/* Points */}
      <div className="text-right shrink-0">
        <Text as="span" size="xs" font="bold" color="primary">
          {(user.points ?? 0).toLocaleString()}
        </Text>
        <Text as="span" size="xs" color="secondary" className="text-[10px] ml-1">
          {isArabic ? "نقطة" : "pts"}
        </Text>
      </div>
    </Link>
  );
}

// ─── Current User Card ──────────────────────────────────
function CurrentUserCard({
  user,
  isArabic,
  tLeaderboard,
}: {
  user: LeaderboardUser;
  isArabic: boolean;
  tLeaderboard: { yourRank: string; pts: string };
}) {
  return (
    <div className="sticky bottom-4 mx-4">
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Trophy className="h-4 w-4 text-primary" />
          </div>
          <UserAvatar user={user} size="sm" />
          <div className="flex-1 min-w-0">
            <Text as="p" size="xs" font="bold" color="primary" className="truncate">
              {user.fullName || user.username}
            </Text>
            <Text as="p" size="xs" color="secondary" className="text-[10px]">
              {tLeaderboard.yourRank}: #{user.rank ?? "—"}
            </Text>
          </div>
          <div className="text-right shrink-0">
            <Text as="span" size="lg" font="extraBold" color="primary">
              {(user.points ?? 0).toLocaleString()}
            </Text>
            <Text as="span" size="xs" color="secondary" className="text-[10px] ml-1">
              {tLeaderboard.pts}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────
export default function LeaderboardPage() {
  const { data, isLoading } = useLeaderboard();
  const { t, isArabic } = useLanguage();
  const tLb = t.leaderboard;

  return (
    <div className="min-h-screen bg-bgPrimary">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="p-2 rounded-xl bg-bgSecondary/60 hover:bg-bgSecondary border border-borderPrimary/40 transition-colors"
          >
            <ArrowLeft className={`h-4 w-4 text-textPrimary ${isArabic ? "rotate-180" : ""}`} />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              <Text as="h1" size="xl" font="extraBold" color="primary">
                {tLb.title}
              </Text>
            </div>
            <Text as="p" size="xs" color="secondary" className="mt-0.5">
              {tLb.subtitle}
            </Text>
          </div>
        </div>

        {/* Podium Skeleton or Content */}
        {isLoading ? (
          <>
            <PodiumSkeleton />
            <div className="space-y-1 mt-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <RankRowSkeleton key={i} />
              ))}
            </div>
          </>
        ) : !data || data.top10.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-bgSecondary flex items-center justify-center">
              <Trophy className="h-8 w-8 text-textSecondary/40" />
            </div>
            <Text as="p" size="sm" color="secondary" font="medium">
              {tLb.noData}
            </Text>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <Podium users={data.top10.slice(0, 3)} isArabic={isArabic} />

            {/* Divider */}
            <div className="border-t border-borderPrimary/40 my-4" />

            {/* Ranks 4-10 */}
            {data.top10.length > 3 && (
              <div className="space-y-1">
                <Text as="p" size="xs" font="bold" color="secondary" className="px-4 mb-2">
                  {tLb.topStudents}
                </Text>
                {data.top10.slice(3).map((user, idx) => (
                  <RankRow
                    key={user._id}
                    user={user}
                    rank={idx + 4}
                    isArabic={isArabic}
                  />
                ))}
              </div>
            )}

            {/* Current User Rank Card */}
            {data.currentUser && (
              <CurrentUserCard
                user={data.currentUser}
                isArabic={isArabic}
                tLeaderboard={tLb}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
