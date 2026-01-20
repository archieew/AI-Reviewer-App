// =============================================
// Quiz API Route
// =============================================
// Get a specific quiz with its questions
// GET /api/quiz/[id]

import { NextRequest, NextResponse } from 'next/server';
import { getQuiz, getQuestionsByQuizId, isSupabaseConfigured } from '@/lib/supabase';

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

    const quizId = params.id;

    if (!quizId) {
      return NextResponse.json(
        { success: false, error: 'Quiz ID is required' },
        { status: 400 }
      );
    }

    // Get quiz from database
    const quiz = await getQuiz(quizId);
    
    if (!quiz) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Get questions for this quiz
    const questions = await getQuestionsByQuizId(quizId);

    return NextResponse.json({
      success: true,
      quiz: {
        ...quiz,
        questions,
      },
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch quiz',
      },
      { status: 500 }
    );
  }
}
