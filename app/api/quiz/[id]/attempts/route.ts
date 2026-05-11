// =============================================
// Quiz Attempts API Route
// =============================================
// Get attempts for a specific quiz
// GET /api/quiz/[id]/attempts

import { NextRequest, NextResponse } from 'next/server';
import { getAttemptsByQuizId, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: 'Database not configured. Please add Supabase credentials to .env.local' },
        { status: 500 }
      );
    }

    const quizId = params.id;

    if (!quizId) {
      return NextResponse.json(
        { success: false, error: 'Quiz ID is required' },
        { status: 400 }
      );
    }

    const attempts = await getAttemptsByQuizId(quizId);

    return NextResponse.json({
      success: true,
      attempts,
    });
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch quiz attempts',
      },
      { status: 500 }
    );
  }
}
