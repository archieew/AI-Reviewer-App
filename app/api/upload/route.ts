// =============================================
// Upload API Route
// =============================================
// Handles file upload and parsing
// POST /api/upload

import { NextRequest, NextResponse } from 'next/server';
import { parseFileBuffer } from '@/lib/parsers';

export async function POST(request: NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the file
    const result = await parseFileBuffer(buffer, file.name);

    // Check if parsing was successful
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to parse file' },
        { status: 400 }
      );
    }

    // Check if content is too short
    if (result.content.length < 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not enough content found in the file. Please upload a file with more text.',
        },
        { status: 400 }
      );
    }

    // Return the parsed content
    return NextResponse.json({
      success: true,
      content: result.content,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process file',
      },
      { status: 500 }
    );
  }
}

// Configure the API route to handle large files
export const config = {
  api: {
    bodyParser: false,
  },
};
