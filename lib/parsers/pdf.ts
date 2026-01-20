// =============================================
// PDF Parser
// =============================================
// Extracts text content from PDF files
// Uses pdf-parse for server-side, pdfjs for client-side

import { ParseResult } from './index';

/**
 * Parse a PDF file and extract all text content
 * Works on both client and server side
 */
export async function parsePDF(input: File | Buffer): Promise<ParseResult> {
  try {
    // Check if we're on the server or client
    const isServer = typeof window === 'undefined';
    
    if (isServer && Buffer.isBuffer(input)) {
      // Server-side: use pdf-parse library
      return await parsePDFServer(input);
    } else if (input instanceof File) {
      // Client-side: use pdfjs-dist or fallback
      return await parsePDFClient(input);
    } else {
      return {
        success: false,
        content: '',
        error: 'Invalid input type for PDF parser',
      };
    }
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return {
      success: false,
      content: '',
      error: `Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Server-side PDF parsing using pdf-parse
 */
async function parsePDFServer(buffer: Buffer): Promise<ParseResult> {
  try {
    // Dynamically import pdf-parse (server-only)
    const pdfParse = (await import('pdf-parse')).default;
    
    const data = await pdfParse(buffer);
    
    if (!data.text || !data.text.trim()) {
      return {
        success: false,
        content: '',
        error: 'No text content found in the PDF file',
      };
    }
    
    // Clean up the text
    const cleanedText = cleanPDFText(data.text);
    
    return {
      success: true,
      content: cleanedText,
      metadata: {
        pageCount: data.numpages,
        title: data.info?.Title || undefined,
      },
    };
  } catch (error) {
    console.error('Server PDF parsing error:', error);
    throw error;
  }
}

/**
 * Client-side PDF parsing
 * Uses a simpler approach that works in the browser
 */
async function parsePDFClient(file: File): Promise<ParseResult> {
  try {
    // For client-side, we'll send to our API endpoint
    // This is a placeholder - actual implementation sends to /api/parse
    
    // Alternative: Use pdf.js in the browser
    // But it's complex to set up, so we'll use the server API
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Note: This will be called from the client
    // The actual parsing happens on the server via API
    // This function is here for type consistency
    
    return {
      success: false,
      content: '',
      error: 'Client-side PDF parsing not available. Please use the upload API.',
    };
  } catch (error) {
    console.error('Client PDF parsing error:', error);
    throw error;
  }
}

/**
 * Clean up extracted PDF text
 * Removes extra whitespace, fixes common issues
 */
function cleanPDFText(text: string): string {
  return text
    // Replace multiple spaces with single space
    .replace(/[ \t]+/g, ' ')
    // Replace multiple newlines with double newline (paragraph break)
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing whitespace from lines
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Remove empty lines at start/end
    .trim();
}

/**
 * Parse PDF from base64 string (useful for API responses)
 */
export async function parsePDFBase64(base64: string): Promise<ParseResult> {
  try {
    const buffer = Buffer.from(base64, 'base64');
    return await parsePDFServer(buffer);
  } catch (error) {
    return {
      success: false,
      content: '',
      error: `Failed to parse PDF from base64: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
