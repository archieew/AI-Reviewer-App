// =============================================
// TypeScript Type Definitions
// =============================================
// Shared types used throughout the application

import { QuestionType } from '@/config/questions';

// =============================================
// Quiz Types
// =============================================

export interface Quiz {
  id: string;
  title: string;
  source_filename: string;
  source_content: string;
  question_type: QuestionType;
  total_questions: number;
  created_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  type: 'multiple_choice' | 'identification' | 'true_false';
  question_text: string;
  correct_answer: string;
  options: string[] | null;
  explanation: string | null;
  order_num: number;
}

export interface QuizWithQuestions extends Quiz {
  questions: Question[];
}

// =============================================
// Quiz Attempt Types
// =============================================

export interface Attempt {
  id: string;
  quiz_id: string;
  score: number;
  total: number;
  answers: Record<string, string>;
  time_spent: number;
  completed_at: string;
}

export interface AttemptWithQuiz extends Attempt {
  quiz: Quiz;
}

// =============================================
// API Response Types
// =============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UploadResponse {
  filename: string;
  content: string;
  slideCount?: number;
  pageCount?: number;
}

export interface GenerateResponse {
  quizId: string;
  title: string;
  questions: Question[];
}

// =============================================
// Quiz Session Types (for taking a quiz)
// =============================================

export interface QuizSession {
  quizId: string;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  startTime: number;
  isComplete: boolean;
}

export interface QuizResult {
  quizId: string;
  score: number;
  total: number;
  percentage: number;
  timeSpent: number;
  answers: Record<string, string>;
  correctAnswers: Record<string, string>;
}

// =============================================
// Form Types
// =============================================

export interface QuizSettings {
  questionType: QuestionType;
  questionCount: number;
  shuffleQuestions: boolean;
  title?: string;
}

export interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

// =============================================
// UI State Types
// =============================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface UIState {
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}
