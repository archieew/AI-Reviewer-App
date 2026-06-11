// =============================================
// Player Stats HUD
// =============================================
// Navbar chips showing streak, XP, and level
// (Duolingo-style persistent game stats)

'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { PlayerStats as PlayerStatsData } from '@/lib/game';

export default function PlayerStats() {
  const pathname = usePathname();
  const [player, setPlayer] = useState<PlayerStatsData | null>(null);

  // Refetch when navigating so XP updates after finishing a quiz
  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/player');
        const data = await response.json();
        if (!cancelled && data.success && data.player) {
          setPlayer(data.player);
        }
      } catch {
        // Stats are decorative; fail silently
      }
    };

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (!player) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Streak flame */}
      <div
        className={`clay-sm px-3 py-1.5 flex items-center gap-1 text-sm font-extrabold ${
          player.currentStreak > 0 ? 'text-orange-500' : 'text-ink-soft'
        }`}
        title={
          player.studiedToday
            ? `${player.currentStreak}-day streak — extended today!`
            : player.currentStreak > 0
            ? `${player.currentStreak}-day streak — study today to keep it alive!`
            : 'Study today to start a streak!'
        }
      >
        🔥 {player.currentStreak}
      </div>

      {/* XP */}
      <div
        className="clay-sm px-3 py-1.5 hidden sm:flex items-center gap-1 text-sm font-extrabold text-amber-500"
        title={`${player.totalXp} XP total — ${player.xpForNextLevel - player.xpIntoLevel} XP to level ${player.level + 1}`}
      >
        ⭐ {player.totalXp.toLocaleString()}
      </div>

      {/* Level badge with progress ring */}
      <div
        className="relative w-10 h-10 rounded-full grid place-items-center shadow-clay-sm"
        style={{
          background: `conic-gradient(#7c3aed 0% ${player.levelProgress}%, #e6ddfa ${player.levelProgress}% 100%)`,
        }}
        title={`Level ${player.level} — ${player.levelProgress}% to next level`}
      >
        <div className="w-7 h-7 rounded-full bg-white grid place-items-center text-[10px] font-extrabold text-primary">
          Lv{player.level}
        </div>
      </div>
    </div>
  );
}
