// =============================================
// Player Stats API Route
// =============================================
// Returns XP, level, and streak derived from attempt history
// GET /api/player

import { NextResponse } from 'next/server';
import { getAllAttempts, isSupabaseConfigured } from '@/lib/supabase';
import { playerStatsFromAttempts } from '@/lib/game';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const attempts = await getAllAttempts();
    const player = playerStatsFromAttempts(attempts);

    return NextResponse.json({ success: true, player });
  } catch (error) {
    console.error('Error building player stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load player stats',
      },
      { status: 500 }
    );
  }
}
