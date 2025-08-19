-- =====================================================================
-- ACADEX - UNIFIED DATABASE SCHEMA
-- =====================================================================
-- This file consolidates all database setup scripts into a single,
-- comprehensive schema for easy deployment and maintenance.
-- Run this script in your Supabase SQL editor for a fresh setup.
-- =====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 1. CORE TABLES
-- =====================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Categories for organizing courses
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration VARCHAR(50),
  image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  instructor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_published BOOLEAN DEFAULT false,
  price DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Course modules
CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(course_id, order_index)
);

-- Course lessons
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER DEFAULT 0,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(module_id, order_index)
);

-- Enrollments
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress DECIMAL(5,2) DEFAULT 0.00 CHECK (progress >= 0 AND progress <= 100),
  UNIQUE(user_id, course_id)
);

-- =====================================================================
-- 2. QUIZ SYSTEM TABLES
-- =====================================================================

-- Quizzes (standalone and lesson-based)
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  category VARCHAR(100),
  difficulty VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER DEFAULT 10,
  passing_score INTEGER DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
  max_attempts INTEGER DEFAULT 3,
  is_published BOOLEAN DEFAULT true,
  image_url TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Quiz questions with support for multiple question types
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type VARCHAR(20) DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank')),
  options JSONB, -- Array of answer options for multiple choice
  correct_answer JSONB NOT NULL, -- Can be index (number) or text
  explanation TEXT,
  order_index INTEGER NOT NULL,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(quiz_id, order_index)
);

-- Quiz attempts with enhanced tracking
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_taken_seconds INTEGER,
  answers JSONB, -- Store user's answers
  passed BOOLEAN GENERATED ALWAYS AS (score >= (SELECT passing_score FROM quizzes WHERE id = quiz_id)) STORED,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================
-- 3. PROGRESS TRACKING
-- =====================================================================

-- User lesson progress
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, lesson_id)
);

-- =====================================================================
-- 4. STORAGE SETUP
-- =====================================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('course-images', 'course-images', true),
  ('quiz-images', 'quiz-images', true),
  ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- 5. FUNCTIONS AND TRIGGERS
-- =====================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at 
  BEFORE UPDATE ON courses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quizzes_updated_at ON quizzes;
CREATE TRIGGER update_quizzes_updated_at 
  BEFORE UPDATE ON quizzes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_lesson_progress_updated_at ON user_lesson_progress;
CREATE TRIGGER update_user_lesson_progress_updated_at 
  BEFORE UPDATE ON user_lesson_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update enrollment progress
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  new_progress DECIMAL(5,2);
  enrollment_record RECORD;
BEGIN
  -- Get the enrollment record
  SELECT e.* INTO enrollment_record
  FROM enrollments e
  JOIN course_lessons cl ON cl.module_id IN (
    SELECT cm.id FROM course_modules cm WHERE cm.course_id = e.course_id
  )
  WHERE e.user_id = NEW.user_id AND cl.id = NEW.lesson_id
  LIMIT 1;

  IF enrollment_record.id IS NOT NULL THEN
    -- Count total lessons in the course
    SELECT COUNT(*) INTO total_lessons
    FROM course_lessons cl
    JOIN course_modules cm ON cm.id = cl.module_id
    WHERE cm.course_id = enrollment_record.course_id;

    -- Count completed lessons
    SELECT COUNT(*) INTO completed_lessons
    FROM user_lesson_progress ulp
    JOIN course_lessons cl ON cl.id = ulp.lesson_id
    JOIN course_modules cm ON cm.id = cl.module_id
    WHERE ulp.user_id = NEW.user_id 
      AND cm.course_id = enrollment_record.course_id
      AND ulp.completed_at IS NOT NULL;

    -- Calculate progress
    new_progress := CASE 
      WHEN total_lessons > 0 THEN (completed_lessons::DECIMAL / total_lessons::DECIMAL) * 100
      ELSE 0
    END;

    -- Update enrollment progress
    UPDATE enrollments 
    SET 
      progress = new_progress,
      completed_at = CASE 
        WHEN new_progress >= 100 AND completed_at IS NULL THEN timezone('utc'::text, now())
        WHEN new_progress < 100 THEN NULL
        ELSE completed_at
      END
    WHERE id = enrollment_record.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update enrollment progress when lessons are completed
DROP TRIGGER IF EXISTS update_enrollment_progress_trigger ON user_lesson_progress;
CREATE TRIGGER update_enrollment_progress_trigger
  AFTER INSERT OR UPDATE ON user_lesson_progress
  FOR EACH ROW EXECUTE FUNCTION update_enrollment_progress();

-- =====================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all users" ON users;
CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Categories policies (public read, admin write)
DROP POLICY IF EXISTS "Categories are publicly readable" ON categories;
CREATE POLICY "Categories are publicly readable" ON categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Courses policies
DROP POLICY IF EXISTS "Published courses are publicly readable" ON courses;
CREATE POLICY "Published courses are publicly readable" ON courses
  FOR SELECT USING (is_published = true OR auth.uid() = instructor_id OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Instructors can manage their courses" ON courses;
CREATE POLICY "Instructors can manage their courses" ON courses
  FOR ALL USING (
    auth.uid() = instructor_id OR 
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'instructor')
  );

-- Course modules policies
DROP POLICY IF EXISTS "Course modules readable by enrolled users" ON course_modules;
CREATE POLICY "Course modules readable by enrolled users" ON course_modules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM courses WHERE id = course_id AND is_published = true) OR
    EXISTS (SELECT 1 FROM enrollments WHERE user_id = auth.uid() AND course_id = course_modules.course_id) OR
    EXISTS (SELECT 1 FROM courses WHERE id = course_id AND instructor_id = auth.uid()) OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "Course instructors can manage modules" ON course_modules;
CREATE POLICY "Course instructors can manage modules" ON course_modules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM courses WHERE id = course_id AND instructor_id = auth.uid()) OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Course lessons policies
DROP POLICY IF EXISTS "Course lessons readable by enrolled users" ON course_lessons;
CREATE POLICY "Course lessons readable by enrolled users" ON course_lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM course_modules cm 
      JOIN courses c ON c.id = cm.course_id 
      WHERE cm.id = module_id AND c.is_published = true
    ) OR
    EXISTS (
      SELECT 1 FROM course_modules cm 
      JOIN enrollments e ON e.course_id = cm.course_id 
      WHERE cm.id = module_id AND e.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM course_modules cm 
      JOIN courses c ON c.id = cm.course_id 
      WHERE cm.id = module_id AND c.instructor_id = auth.uid()
    ) OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "Course instructors can manage lessons" ON course_lessons;
CREATE POLICY "Course instructors can manage lessons" ON course_lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM course_modules cm 
      JOIN courses c ON c.id = cm.course_id 
      WHERE cm.id = module_id AND c.instructor_id = auth.uid()
    ) OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Enrollments policies
DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;
CREATE POLICY "Users can view own enrollments" ON enrollments
  FOR SELECT USING (user_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Users can create own enrollments" ON enrollments;
CREATE POLICY "Users can create own enrollments" ON enrollments
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all enrollments" ON enrollments;
CREATE POLICY "Admins can manage all enrollments" ON enrollments
  FOR ALL USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Quizzes policies
DROP POLICY IF EXISTS "Published quizzes are publicly readable" ON quizzes;
CREATE POLICY "Published quizzes are publicly readable" ON quizzes
  FOR SELECT USING (
    is_published = true OR 
    created_by = auth.uid() OR 
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "Quiz creators can manage their quizzes" ON quizzes;
CREATE POLICY "Quiz creators can manage their quizzes" ON quizzes
  FOR ALL USING (
    created_by = auth.uid() OR 
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Quiz questions policies
DROP POLICY IF EXISTS "Quiz questions readable with quiz access" ON quiz_questions;
CREATE POLICY "Quiz questions readable with quiz access" ON quiz_questions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM quizzes WHERE id = quiz_id AND is_published = true) OR
    EXISTS (SELECT 1 FROM quizzes WHERE id = quiz_id AND created_by = auth.uid()) OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "Quiz creators can manage questions" ON quiz_questions;
CREATE POLICY "Quiz creators can manage questions" ON quiz_questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM quizzes WHERE id = quiz_id AND created_by = auth.uid()) OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Quiz attempts policies
DROP POLICY IF EXISTS "Users can view own quiz attempts" ON quiz_attempts;
CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts
  FOR SELECT USING (user_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Users can create own quiz attempts" ON quiz_attempts;
CREATE POLICY "Users can create own quiz attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own quiz attempts" ON quiz_attempts;
CREATE POLICY "Users can update own quiz attempts" ON quiz_attempts
  FOR UPDATE USING (user_id = auth.uid());

-- User lesson progress policies
DROP POLICY IF EXISTS "Users can manage own progress" ON user_lesson_progress;
CREATE POLICY "Users can manage own progress" ON user_lesson_progress
  FOR ALL USING (user_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- =====================================================================
-- 7. STORAGE POLICIES
-- =====================================================================

-- Course images storage policies
DROP POLICY IF EXISTS "Course images are publicly accessible" ON storage.objects;
CREATE POLICY "Course images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-images');

DROP POLICY IF EXISTS "Authenticated users can upload course images" ON storage.objects;
CREATE POLICY "Authenticated users can upload course images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'course-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own course images" ON storage.objects;
CREATE POLICY "Users can update own course images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'course-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own course images" ON storage.objects;
CREATE POLICY "Users can delete own course images" ON storage.objects
  FOR DELETE USING (bucket_id = 'course-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Quiz images storage policies  
DROP POLICY IF EXISTS "Quiz images are publicly accessible" ON storage.objects;
CREATE POLICY "Quiz images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'quiz-images');

DROP POLICY IF EXISTS "Authenticated users can upload quiz images" ON storage.objects;
CREATE POLICY "Authenticated users can upload quiz images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'quiz-images' AND auth.role() = 'authenticated');

-- User avatars storage policies
DROP POLICY IF EXISTS "User avatars are publicly accessible" ON storage.objects;
CREATE POLICY "User avatars are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-avatars');

DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
CREATE POLICY "Users can upload own avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================================
-- 8. PERFORMANCE INDEXES
-- =====================================================================

-- Core table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_order_index ON course_modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_order_index ON course_lessons(module_id, order_index);

-- Enrollment indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_progress ON enrollments(progress);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON enrollments(user_id, course_id);

-- Quiz system indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_category ON quizzes(category);
CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty ON quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_quizzes_is_published ON quizzes(is_published);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_order_index ON quiz_questions(quiz_id, order_index);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_type ON quiz_questions(question_type);

-- Quiz attempts indexes
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_score ON quiz_attempts(score);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_passed ON quiz_attempts(passed);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created_at ON quiz_attempts(created_at);

-- Progress tracking indexes
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson_id ON user_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_completed ON user_lesson_progress(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_lesson ON user_lesson_progress(user_id, lesson_id);

-- =====================================================================
-- 9. SEED DATA
-- =====================================================================

-- Insert default categories
INSERT INTO categories (name, description, icon, color) VALUES
  ('English Grammar', 'Master the fundamentals of English grammar', 'book', 'blue'),
  ('Business English', 'Professional English for workplace communication', 'briefcase', 'green'),
  ('Conversation Practice', 'Improve your speaking and listening skills', 'message-circle', 'purple'),
  ('Academic English', 'Advanced English for academic purposes', 'graduation-cap', 'red'),
  ('Test Preparation', 'Prepare for IELTS, TOEFL, and other tests', 'target', 'orange')
ON CONFLICT (name) DO NOTHING;

-- Create an admin user function (to be called after setting up a user)
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS void AS $$
BEGIN
  UPDATE users SET role = 'admin' WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- SETUP COMPLETE
-- =====================================================================

-- Display setup completion message
DO $$
BEGIN
  RAISE NOTICE '🎉 Acadex database setup completed successfully!';
  RAISE NOTICE '📊 Created tables: users, categories, courses, course_modules, course_lessons, enrollments, quizzes, quiz_questions, quiz_attempts, user_lesson_progress';
  RAISE NOTICE '🔐 Row Level Security policies configured';
  RAISE NOTICE '📁 Storage buckets and policies set up';
  RAISE NOTICE '⚡ Performance indexes created';
  RAISE NOTICE '🌱 Default categories seeded';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next steps:';
  RAISE NOTICE '1. Create your first admin user by signing up through the app';
  RAISE NOTICE '2. Run: SELECT make_user_admin(''your-email@example.com'');';
  RAISE NOTICE '3. Start creating courses and quizzes!';
END
$$;
