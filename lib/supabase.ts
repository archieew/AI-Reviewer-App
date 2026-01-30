// =============================================
// Supabase Client Configuration
// =============================================
// Handles database and file storage connections

import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
let _supabaseClient: SupabaseClient | null = null;

// Get the Supabase client (creates it if needed)
function getClient(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
  }
  if (!_supabaseClient) {
    _supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabaseClient;
}

// =============================================
// Database Helper Functions
// =============================================

// Quiz functions
export async function createQuiz(quiz: Omit<Quiz, 'id' | 'created_at'>): Promise<Quiz | null> {
  // Skip if Supabase not configured
  if (!isSupabaseConfigured) return null;
  
  const client = getClient();
  const { data, error } = await client
    .from('quizzes')
    .insert(quiz as Record<string, unknown>)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating quiz:', error);
    return null;
  }
  return data as Quiz;
}

export async function getQuiz(id: string): Promise<Quiz | null> {
  if (!isSupabaseConfigured) return null;
  
  const client = getClient();
  const { data, error } = await client
    .from('quizzes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching quiz:', error);
    return null;
  }
  return data as Quiz;
}

export async function getAllQuizzes(): Promise<Quiz[]> {
  if (!isSupabaseConfigured) return [];
  
  const client = getClient();
  // Fetch quizzes ordered by created_at descending (newest first)
  // Using database-level ordering for better performance and reliability
  const { data, error } = await client
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching quizzes:', error);
    return [];
  }
  
  // Return quizzes (already sorted by database)
  return (data || []) as Quiz[];
}

export async function deleteQuiz(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  
  const client = getClient();
  const { error } = await client
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
  
  const client = getClient();
  const { data, error } = await client
    .from('questions')
    .insert(questions as Record<string, unknown>[])
    .select();
  
  if (error) {
    console.error('Error creating questions:', error);
    return [];
  }
  return (data || []) as Question[];
}

export async function getQuestionsByQuizId(quizId: string): Promise<Question[]> {
  if (!isSupabaseConfigured) return [];
  
  const client = getClient();
  const { data, error } = await client
    .from('questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order_num', { ascending: true });
  
  if (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
  return (data || []) as Question[];
}

// Attempt functions
export async function createAttempt(attempt: Omit<Attempt, 'id' | 'completed_at'>): Promise<Attempt | null> {
  if (!isSupabaseConfigured) return null;
  
  const client = getClient();
  const { data, error } = await client
    .from('attempts')
    .insert(attempt as Record<string, unknown>)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating attempt:', error);
    return null;
  }
  return data as Attempt;
}

export async function getAttemptsByQuizId(quizId: string): Promise<Attempt[]> {
  if (!isSupabaseConfigured) return [];
  
  const client = getClient();
  const { data, error } = await client
    .from('attempts')
    .select('*')
    .eq('quiz_id', quizId)
    .order('completed_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching attempts:', error);
    return [];
  }
  return (data || []) as Attempt[];
}

export async function getAllAttempts(): Promise<Attempt[]> {
  if (!isSupabaseConfigured) return [];
  
  const client = getClient();
  const { data, error } = await client
    .from('attempts')
    .select('*')
    .order('completed_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching attempts:', error);
    return [];
  }
  return (data || []) as Attempt[];
}

export async function getAttemptById(id: string): Promise<Attempt | null> {
  if (!isSupabaseConfigured) return null;
  
  const client = getClient();
  const { data, error } = await client
    .from('attempts')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching attempt:', error);
    return null;
  }
  return data as Attempt;
}

// File storage functions
export async function uploadFile(file: File, bucket: string = 'uploads'): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  
  const client = getClient();
  const fileName = `${Date.now()}-${file.name}`;
  
  const { error } = await client.storage
    .from(bucket)
    .upload(fileName, file);
  
  if (error) {
    console.error('Error uploading file:', error);
    return null;
  }
  
  return fileName;
}

export async function getFileUrl(fileName: string, bucket: string = 'uploads'): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  
  const client = getClient();
  const { data } = client.storage
    .from(bucket)
    .getPublicUrl(fileName);
  
  return data?.publicUrl || null;
}
