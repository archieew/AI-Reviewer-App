// =============================================
// Generate Quiz API Route
// =============================================
// Generates quiz questions using AI
// POST /api/generate

import { NextRequest, NextResponse } from 'next/server';
import { generateQuestions } from '@/lib/groq';
import { createQuiz, createQuestions, isSupabaseConfigured } from '@/lib/supabase';
import { QuestionType } from '@/config/questions';

interface GenerateRequest {
  content: string;
  filename: string;
  questionType: QuestionType;
  questionCount: number;
}

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: 'Database not configured. Please add Supabase credentials to .env.local' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: GenerateRequest = await request.json();
    const { content, filename, questionType, questionCount } = body;

    // Validate required fields
    if (!content || !filename || !questionType || !questionCount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate question count
    if (questionCount < 1 || questionCount > 50) {
      return NextResponse.json(
        { success: false, error: 'Question count must be between 1 and 50' },
        { status: 400 }
      );
    }

    // Generate quiz title from filename
    const title = filename
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[-_]/g, ' ')    // Replace dashes/underscores with spaces
      .replace(/\s+/g, ' ')     // Normalize spaces
      .trim();

    // Generate questions using AI
    console.log(`Generating ${questionCount} ${questionType} questions...`);
    const generatedQuestions = await generateQuestions(
      content,
      questionType,
      questionCount
    );

    // Check if we got questions
    if (!generatedQuestions || generatedQuestions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate questions. Please try again.' },
        { status: 500 }
      );
    }

    // Create quiz in database
    const quiz = await createQuiz({
      title: title || 'Quiz',
      source_filename: filename,
      source_content: content.substring(0, 5000), // Limit stored content
      question_type: questionType,
      total_questions: generatedQuestions.length,
    });

    if (!quiz) {
      return NextResponse.json(
        { success: false, error: 'Failed to save quiz to database' },
        { status: 500 }
      );
    }

    // Format questions for database
    const questionsToSave = generatedQuestions.map((q, index) => ({
      quiz_id: quiz.id,
      type: q.type,
      question_text: q.question_text,
      correct_answer: q.correct_answer,
      options: q.options || null,
      explanation: q.explanation || null,
      order_num: index + 1,
    }));

    // Save questions to database
    await createQuestions(questionsToSave);

    // Return success with quiz ID
    return NextResponse.json({
      success: true,
      quizId: quiz.id,
      title: quiz.title,
      questionCount: generatedQuestions.length,
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate quiz',
      },
      { status: 500 }
    );
  }
}
