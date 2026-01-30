-- =============================================
-- Bebe's Reviewer Database Schema
-- =============================================
-- Run this SQL in Supabase SQL Editor to set up your database
-- Go to: Supabase Dashboard > SQL Editor > New Query

-- =============================================
-- 1. QUIZZES TABLE
-- =============================================
-- Stores quiz metadata (title, source file, settings)

CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  source_filename TEXT NOT NULL,
  source_content TEXT NOT NULL,
  question_type TEXT NOT NULL,
  total_questions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries by creation date
CREATE INDEX IF NOT EXISTS idx_quizzes_created_at ON quizzes(created_at DESC);


-- =============================================
-- 2. QUESTIONS TABLE
-- =============================================
-- Stores individual quiz questions

CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  options JSONB DEFAULT NULL,
  explanation TEXT DEFAULT NULL,
  order_num INTEGER NOT NULL DEFAULT 0
);

-- Index for faster queries by quiz_id
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);


-- =============================================
-- 3. ATTEMPTS TABLE
-- =============================================
-- Stores quiz attempt results and user answers

CREATE TABLE IF NOT EXISTS attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}',
  time_spent INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries by quiz_id
CREATE INDEX IF NOT EXISTS idx_attempts_quiz_id ON attempts(quiz_id);
-- Index for faster queries by completion date
CREATE INDEX IF NOT EXISTS idx_attempts_completed_at ON attempts(completed_at DESC);


-- =============================================
-- 4. BOOKMARKS TABLE
-- =============================================
-- Stores bookmarked/favorite questions for quick review

CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(question_id)
);

-- Index for faster queries by quiz_id
CREATE INDEX IF NOT EXISTS idx_bookmarks_quiz_id ON bookmarks(quiz_id);
-- Index for faster queries by creation date
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(created_at DESC);


-- =============================================
-- 5. STUDY NOTES TABLE
-- =============================================
-- Stores user annotations and notes for questions

CREATE TABLE IF NOT EXISTS study_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(question_id)
);

-- Index for faster queries by quiz_id
CREATE INDEX IF NOT EXISTS idx_study_notes_quiz_id ON study_notes(quiz_id);
-- Index for faster queries by creation date
CREATE INDEX IF NOT EXISTS idx_study_notes_created_at ON study_notes(created_at DESC);


-- =============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =============================================
-- Enable RLS but allow all operations (no auth required)
-- You can add authentication later if needed

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (public access)
CREATE POLICY "Allow all operations on quizzes" ON quizzes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on questions" ON questions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on attempts" ON attempts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on bookmarks" ON bookmarks
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on study_notes" ON study_notes
  FOR ALL USING (true) WITH CHECK (true);

-- Enable RLS on new tables
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_notes ENABLE ROW LEVEL SECURITY;


-- =============================================
-- DONE! Your database is ready.
-- =============================================
