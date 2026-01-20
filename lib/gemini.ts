// =============================================
// Gemini AI Client
// =============================================
// Handles AI-powered quiz question generation

import { GoogleGenerativeAI } from '@google/generative-ai';
import { QuestionType } from '@/config/questions';

// Initialize Gemini client
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Check if Gemini is configured
export const isGeminiConfigured = Boolean(apiKey);

// Generated question structure
export interface GeneratedQuestion {
  type: 'multiple_choice' | 'identification' | 'true_false';
  question_text: string;
  correct_answer: string;
  options?: string[];
  explanation?: string;
}

// =============================================
// Question Generation Functions
// =============================================

/**
 * Generate quiz questions from content using Gemini AI
 * @param content - The extracted text from the uploaded file
 * @param type - Type of questions to generate
 * @param count - Number of questions to generate
 */
export async function generateQuestions(
  content: string,
  type: QuestionType,
  count: number
): Promise<GeneratedQuestion[]> {
  // Get the Gemini model
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Build the prompt based on question type
  const prompt = buildPrompt(content, type, count);

  try {
    // Check if API key is configured
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in .env file');
    }

    console.log('Calling Gemini API...');
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini response received, parsing...');

    // Parse the JSON response
    const questions = parseQuestionsFromResponse(text, type);
    
    return questions;
  } catch (error) {
    // Log the actual error details
    console.error('Gemini API Error Details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new Error(`Failed to generate questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Build the prompt for Gemini based on question type
 */
function buildPrompt(content: string, type: QuestionType, count: number): string {
  const baseInstruction = `You are an expert quiz maker. Based on the following study material, create ${count} quiz questions.
  
STUDY MATERIAL:
${content}

IMPORTANT RULES:
- Questions must be directly based on the content provided
- Make questions clear and unambiguous
- Provide helpful explanations for each answer
- Return ONLY valid JSON, no markdown or extra text`;

  if (type === 'multiple_choice') {
    return `${baseInstruction}

Generate ${count} MULTIPLE CHOICE questions. Each question should have 4 options (A, B, C, D) with only one correct answer.

Return a JSON array with this exact structure:
[
  {
    "type": "multiple_choice",
    "question_text": "What is...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option A",
    "explanation": "This is correct because..."
  }
]`;
  }

  if (type === 'identification') {
    return `${baseInstruction}

Generate ${count} IDENTIFICATION questions. These are fill-in-the-blank questions where the student must recall the exact term or concept.

Return a JSON array with this exact structure:
[
  {
    "type": "identification",
    "question_text": "The process of... is called _____.",
    "correct_answer": "the exact term",
    "explanation": "This term refers to..."
  }
]`;
  }

  if (type === 'true_false') {
    return `${baseInstruction}

Generate ${count} TRUE OR FALSE questions. Make statements that are either clearly true or clearly false based on the content.

Return a JSON array with this exact structure:
[
  {
    "type": "true_false",
    "question_text": "Statement about the content...",
    "options": ["True", "False"],
    "correct_answer": "True",
    "explanation": "This statement is true because..."
  }
]`;
  }

  // Mixed mode - combination of all types
  const mcCount = Math.floor(count * 0.4);  // 40% multiple choice
  const idCount = Math.floor(count * 0.3);  // 30% identification
  const tfCount = count - mcCount - idCount; // 30% true/false

  return `${baseInstruction}

Generate a MIX of question types:
- ${mcCount} MULTIPLE CHOICE questions (4 options each)
- ${idCount} IDENTIFICATION questions (fill-in-the-blank)
- ${tfCount} TRUE OR FALSE questions

Return a JSON array with mixed question types:
[
  {
    "type": "multiple_choice",
    "question_text": "What is...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option A",
    "explanation": "This is correct because..."
  },
  {
    "type": "identification",
    "question_text": "The term for... is _____.",
    "correct_answer": "the exact term",
    "explanation": "This term means..."
  },
  {
    "type": "true_false",
    "question_text": "Statement...",
    "options": ["True", "False"],
    "correct_answer": "True",
    "explanation": "This is true because..."
  }
]`;
}

/**
 * Parse the AI response into question objects
 */
function parseQuestionsFromResponse(
  responseText: string,
  type: QuestionType
): GeneratedQuestion[] {
  try {
    // Clean the response - remove markdown code blocks if present
    let cleanedText = responseText.trim();
    
    // Remove ```json and ``` markers if present
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3);
    }
    
    cleanedText = cleanedText.trim();
    
    // Parse JSON
    const questions: GeneratedQuestion[] = JSON.parse(cleanedText);
    
    // Validate and clean up questions
    return questions.map((q, index) => ({
      type: q.type || type,
      question_text: q.question_text || `Question ${index + 1}`,
      correct_answer: q.correct_answer || '',
      options: q.options || undefined,
      explanation: q.explanation || undefined,
    }));
  } catch (error) {
    console.error('Error parsing questions:', error);
    console.error('Raw response:', responseText);
    throw new Error('Failed to parse generated questions');
  }
}

/**
 * Simple function to test if Gemini connection works
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent('Say "Hello" if you can hear me.');
    const response = await result.response;
    return response.text().toLowerCase().includes('hello');
  } catch {
    return false;
  }
}
