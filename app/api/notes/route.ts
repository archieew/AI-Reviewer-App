// =============================================
// Study Notes API Route
// =============================================
// Handle study notes operations
// GET /api/notes?questionId=xxx - Get note for question
// POST /api/notes - Create or update note
// DELETE /api/notes?questionId=xxx - Delete note

import { NextRequest, NextResponse } from 'next/server';
import {
  createOrUpdateStudyNote,
  getStudyNote,
  deleteStudyNote,
  getStudyNotesByQuizId,
  isSupabaseConfigured,
} from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Get note for a question or all notes for a quiz
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const questionId = searchParams.get('questionId');
    const quizId = searchParams.get('quizId');

    if (questionId) {
      // Get note for specific question
      const note = await getStudyNote(questionId);
      return NextResponse.json({
        success: true,
        note,
      });
    } else if (quizId) {
      // Get all notes for a quiz
      const notes = await getStudyNotesByQuizId(quizId);
      return NextResponse.json({
        success: true,
        notes,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Missing questionId or quizId' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error fetching study notes:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch study notes',
      },
      { status: 500 }
    );
  }
}

// Create or update note
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { questionId, quizId, noteText } = body;

    if (!questionId || !quizId || !noteText) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const note = await createOrUpdateStudyNote(questionId, quizId, noteText);

    if (!note) {
      return NextResponse.json(
        { success: false, error: 'Failed to save note' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      note,
    });
  } catch (error) {
    console.error('Error saving study note:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save study note',
      },
      { status: 500 }
    );
  }
}

// Delete note
export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const questionId = searchParams.get('questionId');

    if (!questionId) {
      return NextResponse.json(
        { success: false, error: 'Missing questionId' },
        { status: 400 }
      );
    }

    const success = await deleteStudyNote(questionId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete note' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting study note:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete study note',
      },
      { status: 500 }
    );
  }
}
