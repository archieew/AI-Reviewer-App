// =============================================
// Quizzes List API Route
// =============================================
// Get all quizzes with their attempts
// GET /api/quizzes

import { NextResponse } from 'next/server';
import { getAllQuizzes, getAttemptsByQuizId, isSupabaseConfigured } from '@/lib/supabase';

// Force dynamic rendering to prevent caching in production
// This ensures recent quizzes always appear in history
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: 'Database not configured. Please add Supabase credentials to .env.local' },
        { status: 500 }
      );
    }

    // Get all quizzes from database
    const quizzes = await getAllQuizzes();

    // Get attempts for each quiz
    const quizzesWithAttempts = await Promise.all(
      quizzes.map(async (quiz) => {
        const attempts = await getAttemptsByQuizId(quiz.id);
        return { ...quiz, attempts };
      })
    );

    return NextResponse.json({
      success: true,
      quizzes: quizzesWithAttempts,
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch quizzes',
      },
      { status: 500 }
    );
  }
}
