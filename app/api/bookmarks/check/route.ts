// =============================================
// Check Bookmark Status API Route
// =============================================
// Check if a question is bookmarked
// GET /api/bookmarks/check?questionId=xxx

import { NextRequest, NextResponse } from 'next/server';
import { isQuestionBookmarked, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    if (!questionId) {
      return NextResponse.json(
        { success: false, error: 'Missing questionId' },
        { status: 400 }
      );
    }

    const isBookmarked = await isQuestionBookmarked(questionId);

    return NextResponse.json({
      success: true,
      isBookmarked,
    });
  } catch (error) {
    console.error('Error checking bookmark:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check bookmark',
      },
      { status: 500 }
    );
  }
}
