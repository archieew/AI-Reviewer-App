// =============================================
// Bookmarks API Route
// =============================================
// Handle bookmark operations
// GET /api/bookmarks - Get all bookmarks
// POST /api/bookmarks - Create bookmark
// DELETE /api/bookmarks - Delete bookmark

import { NextRequest, NextResponse } from 'next/server';
import {
  createBookmark,
  deleteBookmark,
  getBookmarkedQuestions,
  isSupabaseConfigured,
} from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Get all bookmarks
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const quizId = searchParams.get('quizId');

    const bookmarks = await getBookmarkedQuestions(quizId || undefined);

    return NextResponse.json({
      success: true,
      bookmarks,
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch bookmarks',
      },
      { status: 500 }
    );
  }
}

// Create bookmark
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { questionId, quizId } = body;

    if (!questionId || !quizId) {
      return NextResponse.json(
        { success: false, error: 'Missing questionId or quizId' },
        { status: 400 }
      );
    }

    const bookmark = await createBookmark(questionId, quizId);

    if (!bookmark) {
      return NextResponse.json(
        { success: false, error: 'Failed to create bookmark or already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      bookmark,
    });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create bookmark',
      },
      { status: 500 }
    );
  }
}

// Delete bookmark
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

    const success = await deleteBookmark(questionId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete bookmark' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete bookmark',
      },
      { status: 500 }
    );
  }
}
