// =============================================
// Groq AI Client
// =============================================
// Handles AI-powered quiz question generation using Groq
// Optimized for BOARD EXAM preparation accuracy!

import Groq from 'groq-sdk';
import { QuestionType } from '@/config/questions';

// Initialize Groq client
const apiKey = process.env.GROQ_API_KEY || '';
const groq = new Groq({ apiKey });

// Check if Groq is configured
export const isGroqConfigured = Boolean(apiKey);

// Generated question structure
export interface GeneratedQuestion {
  type: 'multiple_choice' | 'identification' | 'true_false';
  question_text: string;
  correct_answer: string;
  options?: string[];
  explanation?: string;
  source_reference?: string; // Where in the content this came from
}

// =============================================
// Question Generation Functions
// =============================================

/**
 * Generate quiz questions from content using Groq AI
 * @param content - The extracted text from the uploaded file
 * @param type - Type of questions to generate
 * @param count - Number of questions to generate
 */
export async function generateQuestions(
  content: string,
  type: QuestionType,
  count: number
): Promise<GeneratedQuestion[]> {
  try {
    // Check if API key is configured
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured in .env file');
    }

    console.log('Calling Groq API...');

    // Build the prompt based on question type
    const prompt = buildPrompt(content, type, count);

    // Generate content using Groq (Llama 3.3 70B model)
    // Using LOW temperature (0.2) for maximum accuracy - important for board exams!
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert quiz maker specializing in OCCUPATIONAL THERAPY (OT) BOARD EXAM preparation.

You are helping an OT student prepare for their licensure examination. Focus on:
- OT theories, models, and frames of reference
- Anatomy, physiology, and medical conditions relevant to OT
- Assessment tools and evaluation methods
- Intervention strategies and therapeutic techniques
- Ethics, laws, and professional standards in OT practice
- Research methods and evidence-based practice

CRITICAL REQUIREMENTS FOR ACCURACY:
- ONLY create questions that can be DIRECTLY answered from the provided study material
- NEVER make up facts or information not in the source content
- The correct answer MUST be explicitly stated or directly implied in the source material
- Include the exact quote or reference from the source in your explanation
- Questions should test recall and understanding of KEY CONCEPTS for OT practice
- Avoid trick questions - be clear and straightforward
- All distractors (wrong answers) should be plausible but clearly incorrect based on the source

Always respond with valid JSON only, no markdown or extra text.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2, // Low temperature for factual accuracy
      max_tokens: 4096,
    });

    const text = completion.choices[0]?.message?.content || '';
    
    console.log('Groq response received, parsing...');

    // Parse the JSON response
    const questions = parseQuestionsFromResponse(text, type);

    return questions;
  } catch (error) {
    // Log the actual error details
    console.error('Groq API Error Details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
    });
    throw new Error(`Failed to generate questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Build the prompt for Groq based on question type
 * Optimized for OT BOARD EXAM preparation accuracy
 */
function buildPrompt(content: string, type: QuestionType, count: number): string {
  const baseInstruction = `You are creating questions for an OCCUPATIONAL THERAPY (OT) BOARD EXAM review.

STUDY MATERIAL TO BASE QUESTIONS ON:
"""
${content.substring(0, 10000)}
"""

CRITICAL ACCURACY REQUIREMENTS:
1. ONLY ask about information EXPLICITLY stated in the study material above
2. The correct answer MUST be found word-for-word or directly stated in the source
3. In your explanation, QUOTE the exact part of the study material that contains the answer
4. Do NOT add external knowledge - stick strictly to the provided content
5. Make questions that test important concepts likely to appear on board exams
6. Be precise with medical/professional terminology

Return ONLY valid JSON array, no markdown or extra text.`;

  if (type === 'multiple_choice') {
    return `${baseInstruction}

Generate ${count} MULTIPLE CHOICE questions for board exam review.

Requirements:
- 4 answer options (only ONE correct answer)
- Wrong options should be plausible but clearly incorrect based on the source
- Focus on key definitions, principles, and important facts
- Include the SOURCE QUOTE in the explanation

Return JSON array:
[
  {
    "type": "multiple_choice",
    "question_text": "According to [source], what is...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option A",
    "explanation": "The correct answer is Option A. According to the study material: '[exact quote from source]'. This is important because..."
  }
]`;
  }

  if (type === 'identification') {
    return `${baseInstruction}

Generate ${count} IDENTIFICATION questions for board exam review. These test recall of specific terms and definitions.

Requirements:
- Ask for specific terms, names, or concepts
- The answer must be explicitly stated in the source
- Include the SOURCE QUOTE in the explanation

Return JSON array:
[
  {
    "type": "identification",
    "question_text": "According to the study material, _____ is defined as the process of...",
    "correct_answer": "exact term from source",
    "explanation": "The answer is 'exact term'. According to the study material: '[exact quote from source]'."
  }
]`;
  }

  if (type === 'true_false') {
    return `${baseInstruction}

Generate ${count} TRUE OR FALSE questions for board exam review.

Requirements:
- Statements must be clearly true OR false based on the source (no ambiguity)
- For FALSE statements, change ONE key detail from the source
- Include the SOURCE QUOTE in the explanation to prove the answer

Return JSON array:
[
  {
    "type": "true_false",
    "question_text": "According to the study material, [statement].",
    "options": ["True", "False"],
    "correct_answer": "True",
    "explanation": "This is TRUE. The study material states: '[exact quote from source]'."
  }
]`;
  }

  // Mixed mode - combination of all types
  const mcCount = Math.floor(count * 0.5);  // 50% multiple choice (most common in boards)
  const idCount = Math.floor(count * 0.25); // 25% identification
  const tfCount = count - mcCount - idCount; // 25% true/false

  return `${baseInstruction}

Generate a MIX of question types for comprehensive board exam review:
- ${mcCount} MULTIPLE CHOICE questions (most important for board exams)
- ${idCount} IDENTIFICATION questions (test terminology recall)
- ${tfCount} TRUE OR FALSE questions (test fact recognition)

Requirements for ALL questions:
- Include SOURCE QUOTE in every explanation
- Focus on testable, clinically relevant OT content
- Use proper OT terminology and language

Return JSON array with mixed types:
[
  {
    "type": "multiple_choice",
    "question_text": "Question text...",
    "options": ["A", "B", "C", "D"],
    "correct_answer": "A",
    "explanation": "Correct because: '[quote from source]'..."
  },
  {
    "type": "identification",
    "question_text": "Fill in: _____...",
    "correct_answer": "term",
    "explanation": "The term is found in: '[quote from source]'..."
  },
  {
    "type": "true_false",
    "question_text": "Statement...",
    "options": ["True", "False"],
    "correct_answer": "True",
    "explanation": "True because: '[quote from source]'..."
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
 * Simple function to test if Groq connection works
 */
export async function testGroqConnection(): Promise<boolean> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say "Hello" if you can hear me.' }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 10,
    });
    return completion.choices[0]?.message?.content?.toLowerCase().includes('hello') || false;
  } catch {
    return false;
  }
}
