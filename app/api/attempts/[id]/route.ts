// =============================================
// Attempt API Route
// =============================================
// Get a specific attempt
// GET /api/attempts/[id]

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: 'Database not configured. Please add Supabase credentials to .env.local' },
        { status: 500 }
      );
    }

    const attemptId = params.id;

    if (!attemptId) {
      return NextResponse.json(
        { success: false, error: 'Attempt ID is required' },
        { status: 400 }
      );
    }

    // Get attempt from database
    const { data: attempt, error } = await supabase
      .from('attempts')
      .select('*')
      .eq('id', attemptId)
      .single();

    if (error || !attempt) {
      return NextResponse.json(
        { success: false, error: 'Attempt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      attempt,
    });
  } catch (error) {
    console.error('Error fetching attempt:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch attempt',
      },
      { status: 500 }
    );
  }
}
