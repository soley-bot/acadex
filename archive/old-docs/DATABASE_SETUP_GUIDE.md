# Database Setup Instructions

## Problem
The admin panel is showing "Quizzes query error: {}" because the database tables don't exist or have incorrect schema.

## Solution

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `qeoeimktkpdlbblvwhri`
3. Go to **SQL Editor** in the left sidebar

### Step 2: Create Tables
Copy and paste this SQL script into the SQL Editor and run it:

```sql
-- CHUNK 2: Core Table Creation

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  duration_hours INTEGER DEFAULT 0,
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT DEFAULT 'english',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  course_id UUID,
  difficulty TEXT DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  time_limit INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank')),
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  UNIQUE(user_id, course_id)
);

-- Quiz attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL,
  score INTEGER DEFAULT 0,
  total_questions INTEGER NOT NULL,
  time_taken INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answers JSONB
);

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'courses', 'quizzes', 'questions', 'enrollments', 'quiz_attempts')
ORDER BY table_name;
```

### Step 3: Add Sample Data
After tables are created, run this script for sample data:

```sql
-- Insert sample users
INSERT INTO public.users (id, email, name, role) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'admin01@acadex.com', 'Admin User', 'admin'),
('550e8400-e29b-41d4-a716-446655440002', 'instructor@acadex.com', 'John Smith', 'instructor'),
('550e8400-e29b-41d4-a716-446655440003', 'student@acadex.com', 'Jane Doe', 'student')
ON CONFLICT (id) DO NOTHING;

-- Insert sample courses
INSERT INTO public.courses (id, title, description, instructor_id, price, duration_hours, level, category) VALUES 
('660e8400-e29b-41d4-a716-446655440001', 'English Grammar Fundamentals', 'Master the basics of English grammar with comprehensive lessons covering tenses, sentence structure, and common grammar rules.', '550e8400-e29b-41d4-a716-446655440002', 49.99, 20, 'beginner', 'english'),
('660e8400-e29b-41d4-a716-446655440002', 'Business English Communication', 'Improve your professional English skills with lessons on business writing, presentations, and workplace communication.', '550e8400-e29b-41d4-a716-446655440002', 79.99, 30, 'intermediate', 'english'),
('660e8400-e29b-41d4-a716-446655440003', 'Advanced English Conversation', 'Develop fluency and confidence in English conversation through interactive exercises and real-world scenarios.', '550e8400-e29b-41d4-a716-446655440002', 69.99, 25, 'advanced', 'english')
ON CONFLICT (id) DO NOTHING;

-- Insert sample quizzes
INSERT INTO public.quizzes (id, title, description, course_id, difficulty, time_limit) VALUES 
('770e8400-e29b-41d4-a716-446655440001', 'Grammar Basics Quiz', 'Test your understanding of basic English grammar rules and sentence structure.', '660e8400-e29b-41d4-a716-446655440001', 'easy', 15),
('770e8400-e29b-41d4-a716-446655440002', 'Business Vocabulary Quiz', 'Assess your knowledge of common business English terms and phrases.', '660e8400-e29b-41d4-a716-446655440002', 'medium', 20),
('770e8400-e29b-41d4-a716-446655440003', 'Advanced Grammar Challenge', 'Challenge yourself with complex grammar structures and advanced language concepts.', '660e8400-e29b-41d4-a716-446655440003', 'hard', 25)
ON CONFLICT (id) DO NOTHING;

-- Add sample questions
INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points) VALUES 
('770e8400-e29b-41d4-a716-446655440001', 'What is the past tense of "go"?', '["went", "goed", "gone", "going"]', 'went', 'The past tense of "go" is "went".', 1),
('770e8400-e29b-41d4-a716-446655440001', 'Which sentence is correct?', '["I have ate lunch.", "I have eaten lunch.", "I has eaten lunch.", "I ate have lunch."]', 'I have eaten lunch.', 'The present perfect tense uses "have/has + past participle".', 1),
('770e8400-e29b-41d4-a716-446655440002', 'What does "deadline" mean in business?', '["A fishing term", "The final date for completion", "A type of meeting", "An office supply"]', 'The final date for completion', 'A deadline is the latest time or date by which something should be completed.', 1)
ON CONFLICT (quiz_id, question_text) DO NOTHING;
```

### Step 4: Set Permissions (Optional)
If you get permission errors, run this:

```sql
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict later)
CREATE POLICY "Allow all users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all courses" ON public.courses FOR ALL USING (true);
CREATE POLICY "Allow all quizzes" ON public.quizzes FOR ALL USING (true);
CREATE POLICY "Allow all questions" ON public.questions FOR ALL USING (true);
CREATE POLICY "Allow all enrollments" ON public.enrollments FOR ALL USING (true);
CREATE POLICY "Allow all quiz_attempts" ON public.quiz_attempts FOR ALL USING (true);
```

### Step 5: Test
After running the SQL scripts:
1. Go to http://localhost:3000/database-setup
2. Click "Check Tables" - should show all green checkmarks
3. Go to http://localhost:3000/admin/quizzes - should load without errors

## Schema Details

### Key Differences from Expected:
- `difficulty`: 'easy' | 'medium' | 'hard' (not 'beginner' | 'intermediate' | 'advanced')
- `time_limit`: number (not `time_limit_minutes`)
- `is_active`: boolean (not `is_published`)
- `level`: 'beginner' | 'intermediate' | 'advanced' (for courses)
- `duration_hours`: number (not `duration`)

The code has been updated to match this schema.
