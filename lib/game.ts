// =============================================
// Game Engine Helpers
// =============================================
// XP, levels, and streaks are derived from the attempts
// history, so they persist without any schema changes.

import { Attempt } from '@/lib/supabase';

// XP awarded per correct answer
export const XP_PER_CORRECT = 10;

// XP needed to advance one level
export const XP_PER_LEVEL = 250;

// Quiz game mode tuning
export const GAME_CONFIG = {
  hearts: 5,
  secondsPerQuestion: 30,
  basePoints: 100,
  // Up to this many bonus points for an instant answer (Kahoot-style)
  maxSpeedBonus: 100,
  // Extra points per combo step (3 in a row = +30, 4 = +45, ...)
  comboBonus: 15,
} as const;

export interface PlayerStats {
  totalXp: number;
  level: number;
  // XP accumulated within the current level
  xpIntoLevel: number;
  // XP needed to reach the next level
  xpForNextLevel: number;
  // 0-100 progress within the current level
  levelProgress: number;
  currentStreak: number;
  longestStreak: number;
  // Whether the user has already studied today
  studiedToday: boolean;
}

// Total XP earned across all attempts
export function xpFromAttempts(attempts: Attempt[]): number {
  return attempts.reduce((sum, attempt) => sum + attempt.score * XP_PER_CORRECT, 0);
}

function startOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

// Current and longest daily streaks from attempt dates.
// The current streak survives until the end of today, even if
// the user hasn't studied yet today (Duolingo behavior).
export function streaksFromAttempts(attempts: Attempt[]): {
  currentStreak: number;
  longestStreak: number;
  studiedToday: boolean;
} {
  const dayMs = 24 * 60 * 60 * 1000;
  const days = new Set(
    attempts.map((attempt) => startOfDay(new Date(attempt.completed_at)).getTime())
  );

  if (days.size === 0) {
    return { currentStreak: 0, longestStreak: 0, studiedToday: false };
  }

  const today = startOfDay(new Date()).getTime();
  const studiedToday = days.has(today);

  // Current streak: walk back from today (or yesterday if today is still pending)
  let cursor = studiedToday ? today : today - dayMs;
  let currentStreak = 0;
  while (days.has(cursor)) {
    currentStreak++;
    cursor -= dayMs;
  }

  // Longest streak across all history
  const sortedDays = Array.from(days).sort((a, b) => a - b);
  let longestStreak = 1;
  let run = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    if (sortedDays[i] - sortedDays[i - 1] === dayMs) {
      run++;
      longestStreak = Math.max(longestStreak, run);
    } else {
      run = 1;
    }
  }

  return { currentStreak, longestStreak, studiedToday };
}

export function playerStatsFromAttempts(attempts: Attempt[]): PlayerStats {
  const totalXp = xpFromAttempts(attempts);
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = totalXp % XP_PER_LEVEL;
  const { currentStreak, longestStreak, studiedToday } = streaksFromAttempts(attempts);

  return {
    totalXp,
    level,
    xpIntoLevel,
    xpForNextLevel: XP_PER_LEVEL,
    levelProgress: Math.round((xpIntoLevel / XP_PER_LEVEL) * 100),
    currentStreak,
    longestStreak,
    studiedToday,
  };
}

// Kahoot-style points for one correct answer
export function pointsForAnswer(secondsLeft: number, combo: number): number {
  const speedBonus = Math.round(
    (secondsLeft / GAME_CONFIG.secondsPerQuestion) * GAME_CONFIG.maxSpeedBonus
  );
  const comboBonus = combo >= 3 ? (combo - 2) * GAME_CONFIG.comboBonus : 0;
  return GAME_CONFIG.basePoints + speedBonus + comboBonus;
}
