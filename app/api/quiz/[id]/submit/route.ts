// =============================================
// Submit Quiz API Route
// =============================================
// Submit quiz answers and calculate score
// POST /api/quiz/[id]/submit

import { NextRequest, NextResponse } from 'next/server';
import { getQuiz, getQuestionsByQuizId, createAttempt, isSupabaseConfigured } from '@/lib/supabase';

interface SubmitRequest {
  answers: Record<string, string>;
  timeSpent: number;
}

export async function POST(
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
    const body: SubmitRequest = await request.json();
    const { answers, timeSpent } = body;

    if (!quizId) {
      return NextResponse.json(
        { success: false, error: 'Quiz ID is required' },
        { status: 400 }
      );
    }

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Answers are required' },
        { status: 400 }
      );
    }

    // Get quiz and questions
    const quiz = await getQuiz(quizId);
    const questions = await getQuestionsByQuizId(quizId);

    if (!quiz || !questions || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Calculate score
    let score = 0;
    const correctAnswers: Record<string, string> = {};

    for (const question of questions) {
      const userAnswer = answers[question.id]?.toLowerCase().trim() || '';
      const correctAnswer = question.correct_answer.toLowerCase().trim();
      
      correctAnswers[question.id] = question.correct_answer;

      // Check if answer is correct
      if (userAnswer === correctAnswer) {
        score++;
      }
    }

    const total = questions.length;

    // Create attempt record
    const attempt = await createAttempt({
      quiz_id: quizId,
      score,
      total,
      answers,
      time_spent: timeSpent || 0,
    });

    if (!attempt) {
      return NextResponse.json(
        { success: false, error: 'Failed to save attempt' },
        { status: 500 }
      );
    }

    // Return results
    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score,
      total,
      percentage: Math.round((score / total) * 100),
      correctAnswers,
    });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit quiz',
      },
      { status: 500 }
    );
  }
}
