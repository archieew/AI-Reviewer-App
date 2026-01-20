// =============================================
// File Parser Factory
// =============================================
// Routes files to the correct parser based on type
// Easy to add new file types here

import { parsePPTX } from './pptx';
import { parsePDF } from './pdf';

// Supported file extensions
export const SUPPORTED_EXTENSIONS = ['pptx', 'ppt', 'pdf'] as const;
export type SupportedExtension = typeof SUPPORTED_EXTENSIONS[number];

// Result of parsing a file
export interface ParseResult {
  success: boolean;
  content: string;
  error?: string;
  metadata?: {
    pageCount?: number;
    slideCount?: number;
    title?: string;
  };
}

/**
 * Check if a file extension is supported
 */
export function isSupportedFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return SUPPORTED_EXTENSIONS.includes(ext as SupportedExtension);
}

/**
 * Get the file extension from a filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Parse a file and extract its text content
 * Routes to the appropriate parser based on file type
 */
export async function parseFile(file: File): Promise<ParseResult> {
  const extension = getFileExtension(file.name);
  
  // Check if file type is supported
  if (!isSupportedFile(file.name)) {
    return {
      success: false,
      content: '',
      error: `Unsupported file type: .${extension}. Supported types: ${SUPPORTED_EXTENSIONS.join(', ')}`,
    };
  }
  
  try {
    // Route to the correct parser
    switch (extension) {
      case 'pptx':
      case 'ppt':
        return await parsePPTX(file);
      
      case 'pdf':
        return await parsePDF(file);
      
      default:
        return {
          success: false,
          content: '',
          error: `No parser available for .${extension} files`,
        };
    }
  } catch (error) {
    console.error(`Error parsing ${extension} file:`, error);
    return {
      success: false,
      content: '',
      error: `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Parse file from buffer (for server-side processing)
 */
export async function parseFileBuffer(
  buffer: Buffer,
  filename: string
): Promise<ParseResult> {
  const extension = getFileExtension(filename);
  
  if (!isSupportedFile(filename)) {
    return {
      success: false,
      content: '',
      error: `Unsupported file type: .${extension}`,
    };
  }
  
  try {
    switch (extension) {
      case 'pptx':
      case 'ppt':
        // Convert buffer to File-like object for PPTX parser
        const pptxBlob = new Blob([buffer], { 
          type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
        });
        const pptxFile = new File([pptxBlob], filename);
        return await parsePPTX(pptxFile);
      
      case 'pdf':
        // PDF parser can work with buffer directly
        return await parsePDF(buffer);
      
      default:
        return {
          success: false,
          content: '',
          error: `No parser available for .${extension} files`,
        };
    }
  } catch (error) {
    console.error(`Error parsing ${extension} file:`, error);
    return {
      success: false,
      content: '',
      error: `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
