// =============================================
// Supabase Client Configuration
// =============================================
// Handles database and file storage connections

import { createClient } from '@supabase/supabase-js';

// Database types (matches our schema)
export interface Quiz {
  id: string;
  title: string;
  source_filename: string;
  source_content: string;
  question_type: string;
  total_questions: number;
  created_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  type: string;
  question_text: string;
  correct_answer: string;
  options: string[] | null;
  explanation: string | null;
  order_num: number;
}

export interface Attempt {
  id: string;
  quiz_id: string;
  score: number;
  total: number;
  answers: Record<string, string>;
  time_spent: number;
  completed_at: string;
}

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured (must be valid URL format)
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://')
);

// Lazy client initialization - only create when needed and configured
let _supabaseClient: ReturnType<typeof createClient> | null = null;

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
    }
    if (!_supabaseClient) {
      _supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    }
    return (_supabaseClient as Record<string, unknown>)[prop as string];
  }
});

// =============================================
// Database Helper Functions
// =============================================

// Quiz functions
export async function createQuiz(quiz: Omit<Quiz, 'id' | 'created_at'>): Promise<Quiz | null> {
  // Skip if Supabase not configured
  if (!isSupabaseConfigured) return null;
  
  const { data, error } = await supabase
    .from('quizzes')
    .insert(quiz)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating quiz:', error);
    return null;
  }
  return data;
}

export async function getQuiz(id: string): Promise<Quiz | null> {
  if (!isSupabaseConfigured) return null;
  
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching quiz:', error);
    return null;
  }
  return data;
}

export async function getAllQuizzes(): Promise<Quiz[]> {
  if (!isSupabaseConfigured) return [];
  
  // Note: Using JS sort instead of .order() due to Supabase proxy compatibility issue
  const { data, error } = await supabase
    .from('quizzes')
    .select('*');
  
  if (error) {
    console.error('Error fetching quizzes:', error);
    return [];
  }
  
  // Sort by created_at descending (newest first)
  const sortedData = (data || []).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  return sortedData;
}

export async function deleteQuiz(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  
  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting quiz:', error);
    return false;
  }
  return true;
}

// Question functions
export async function createQuestions(questions: Omit<Question, 'id'>[]): Promise<Question[]> {
  if (!isSupabaseConfigured) return [];
  
  const { data, error } = await supabase
    .from('questions')
    .insert(questions)
    .select();
  
  if (error) {
    console.error('Error creating questions:', error);
    return [];
  }
  return data || [];
}

export async function getQuestionsByQuizId(quizId: string): Promise<Question[]> {
  if (!isSupabaseConfigured) return [];
  
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order_num', { ascending: true });
  
  if (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
  return data || [];
}

// Attempt functions
export async function createAttempt(attempt: Omit<Attempt, 'id' | 'completed_at'>): Promise<Attempt | null> {
  if (!isSupabaseConfigured) return null;
  
  const { data, error } = await supabase
    .from('attempts')
    .insert(attempt)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating attempt:', error);
    return null;
  }
  return data;
}

export async function getAttemptsByQuizId(quizId: string): Promise<Attempt[]> {
  if (!isSupabaseConfigured) return [];
  
  const { data, error } = await supabase
    .from('attempts')
    .select('*')
    .eq('quiz_id', quizId)
    .order('completed_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching attempts:', error);
    return [];
  }
  return data || [];
}

export async function getAllAttempts(): Promise<Attempt[]> {
  if (!isSupabaseConfigured) return [];
  
  const { data, error } = await supabase
    .from('attempts')
    .select('*')
    .order('completed_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching attempts:', error);
    return [];
  }
  return data || [];
}

// File storage functions
export async function uploadFile(file: File, bucket: string = 'uploads'): Promise<string | null> {
  const fileName = `${Date.now()}-${file.name}`;
  
  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);
  
  if (error) {
    console.error('Error uploading file:', error);
    return null;
  }
  
  return fileName;
}

export async function getFileUrl(fileName: string, bucket: string = 'uploads'): Promise<string | null> {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
  
  return data?.publicUrl || null;
}
