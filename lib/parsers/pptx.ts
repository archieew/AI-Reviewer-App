// =============================================
// PowerPoint (PPTX) Parser
// =============================================
// Extracts text content from PowerPoint files
// Uses JSZip to read the PPTX (which is a ZIP file with XML inside)

import { ParseResult } from './index';

/**
 * Parse a PowerPoint file and extract all text content
 * PPTX files are actually ZIP archives containing XML files
 */
export async function parsePPTX(file: File | Blob): Promise<ParseResult> {
  try {
    // Dynamically import JSZip (for client-side usage)
    const JSZip = (await import('jszip')).default;
    
    // Read the file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the ZIP contents
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    // Find all slide XML files
    const slideFiles: string[] = [];
    zip.forEach((relativePath) => {
      // Slides are in ppt/slides/slide1.xml, slide2.xml, etc.
      if (relativePath.match(/ppt\/slides\/slide\d+\.xml$/)) {
        slideFiles.push(relativePath);
      }
    });
    
    // Sort slides by number
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0');
      const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0');
      return numA - numB;
    });
    
    // Extract text from each slide
    const slideContents: string[] = [];
    
    for (const slidePath of slideFiles) {
      const slideXml = await zip.file(slidePath)?.async('text');
      if (slideXml) {
        const slideText = extractTextFromSlideXml(slideXml);
        if (slideText.trim()) {
          const slideNum = slidePath.match(/slide(\d+)\.xml/)?.[1] || '?';
          slideContents.push(`[Slide ${slideNum}]\n${slideText}`);
        }
      }
    }
    
    // Combine all slide contents
    const fullContent = slideContents.join('\n\n');
    
    if (!fullContent.trim()) {
      return {
        success: false,
        content: '',
        error: 'No text content found in the PowerPoint file',
      };
    }
    
    return {
      success: true,
      content: fullContent,
      metadata: {
        slideCount: slideFiles.length,
      },
    };
  } catch (error) {
    console.error('Error parsing PPTX:', error);
    return {
      success: false,
      content: '',
      error: `Failed to parse PowerPoint: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Extract text content from a slide's XML
 * The text in PPTX is stored in <a:t> tags
 */
function extractTextFromSlideXml(xml: string): string {
  const textParts: string[] = [];
  
  // Match all <a:t>...</a:t> tags (text content in OOXML)
  const textRegex = /<a:t>([^<]*)<\/a:t>/g;
  let match;
  
  while ((match = textRegex.exec(xml)) !== null) {
    const text = match[1].trim();
    if (text) {
      textParts.push(text);
    }
  }
  
  // Also try to find text in other common tags
  // Sometimes text is in <t>...</t> tags
  const altTextRegex = /<t[^>]*>([^<]*)<\/t>/g;
  while ((match = altTextRegex.exec(xml)) !== null) {
    const text = match[1].trim();
    if (text && !textParts.includes(text)) {
      textParts.push(text);
    }
  }
  
  // Join with appropriate spacing
  // Group text that appears to be in the same paragraph
  let result = '';
  let currentLine = '';
  
  for (const part of textParts) {
    // If this looks like a new bullet point or heading, start a new line
    if (part.match(/^[\d•\-\*]/) || part.length > 50) {
      if (currentLine) {
        result += currentLine + '\n';
      }
      currentLine = part;
    } else {
      // Append to current line
      currentLine += (currentLine ? ' ' : '') + part;
    }
  }
  
  // Don't forget the last line
  if (currentLine) {
    result += currentLine;
  }
  
  return result;
}

/**
 * Alternative: Parse PPTX on the server side using a buffer
 */
export async function parsePPTXBuffer(buffer: Buffer): Promise<ParseResult> {
  // Convert buffer to Blob for the main parser
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  });
  return parsePPTX(blob);
}
