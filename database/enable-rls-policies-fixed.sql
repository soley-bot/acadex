-- =====================================================
-- ENABLE PROPER ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- This replaces the dangerous service_role key bypass
-- Run this in your Supabase SQL Editor AFTER running the security fixes
-- =====================================================

-- 1. ENABLE RLS ON CORE TABLES
-- ============================

-- Enable RLS on courses table
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Enable RLS on enrollments table
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on quizzes table
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Enable RLS on quiz_questions table
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on quiz_attempts table
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Only enable RLS on enhanced tables if they exist
DO $$
BEGIN
  -- Check if course_modules table exists and enable RLS
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'course_modules') THEN
    ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Check if course_lessons table exists and enable RLS  
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'course_lessons') THEN
    ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 2. CREATE CORE RLS POLICIES
-- ============================

-- COURSES POLICIES
-- ================

-- Courses read policy (admins can see all, instructors see their own, students see published enrolled courses)
DROP POLICY IF EXISTS "courses_read_policy" ON public.courses;
CREATE POLICY "courses_read_policy" ON public.courses FOR SELECT USING (
  -- Admins can see all courses
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  OR
  -- Instructors can see their own courses  
  instructor_id = auth.uid()
  OR
  -- Students can see published courses they're enrolled in
  (is_published = true AND EXISTS (
    SELECT 1 FROM public.enrollments WHERE course_id = courses.id AND user_id = auth.uid()
  ))
  OR
  -- Anyone can see published courses for browsing (but not details without enrollment)
  is_published = true
);

-- Courses write policy (admins can modify all, instructors can modify their own)
DROP POLICY IF EXISTS "courses_write_policy" ON public.courses;
CREATE POLICY "courses_write_policy" ON public.courses FOR ALL USING (
  -- Admins can modify all courses
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  OR
  -- Instructors can modify their own courses
  instructor_id = auth.uid()
);

-- ENROLLMENTS POLICIES
-- ====================

DROP POLICY IF EXISTS "enrollments_read_policy" ON public.enrollments;
CREATE POLICY "enrollments_read_policy" ON public.enrollments FOR SELECT USING (
  -- Admins can see all enrollments
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  OR
  -- Instructors can see enrollments for their courses
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = enrollments.course_id 
    AND courses.instructor_id = auth.uid()
  )
  OR
  -- Users can see their own enrollments
  user_id = auth.uid()
);

DROP POLICY IF EXISTS "enrollments_write_policy" ON public.enrollments;
CREATE POLICY "enrollments_write_policy" ON public.enrollments FOR ALL USING (
  -- Admins can modify all enrollments
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  OR
  -- Users can create/modify their own enrollments
  user_id = auth.uid()
);

-- QUIZZES POLICIES (Basic - for standalone quizzes)
-- ================

DROP POLICY IF EXISTS "quizzes_read_policy" ON public.quizzes;
CREATE POLICY "quizzes_read_policy" ON public.quizzes FOR SELECT USING (
  -- Admins can see all quizzes
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  OR
  -- Published quizzes are visible to authenticated users
  (is_published = true AND auth.role() = 'authenticated')
  OR
  -- Instructors and admins can see all quizzes for management
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('instructor', 'admin')
  )
);

DROP POLICY IF EXISTS "quizzes_write_policy" ON public.quizzes;
CREATE POLICY "quizzes_write_policy" ON public.quizzes FOR ALL USING (
  -- Admins can modify all quizzes
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  OR
  -- Instructors can create and modify quizzes
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('instructor', 'admin')
  )
);

-- QUIZ_QUESTIONS POLICIES
-- =======================

DROP POLICY IF EXISTS "quiz_questions_read_policy" ON public.quiz_questions;
CREATE POLICY "quiz_questions_read_policy" ON public.quiz_questions FOR SELECT USING (
  -- Admins can see all questions
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  OR
  -- Users can see questions for published quizzes
  EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_questions.quiz_id
    AND q.is_published = true
    AND auth.role() = 'authenticated'
  )
  OR
  -- Instructors can see all questions for management
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('instructor', 'admin')
  )
);

DROP POLICY IF EXISTS "quiz_questions_write_policy" ON public.quiz_questions;
CREATE POLICY "quiz_questions_write_policy" ON public.quiz_questions FOR ALL USING (
  -- Admins can modify all questions
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  OR
  -- Instructors can create and modify questions
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('instructor', 'admin')
  )
);

-- QUIZ ATTEMPTS POLICIES
-- ======================

DROP POLICY IF EXISTS "quiz_attempts_read_policy" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_read_policy" ON public.quiz_attempts FOR SELECT USING (
  -- Admins can see all attempts
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  OR
  -- Instructors can see all attempts for analytics
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('instructor', 'admin')
  )
  OR
  -- Users can see their own attempts
  user_id = auth.uid()
);

DROP POLICY IF EXISTS "quiz_attempts_write_policy" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_write_policy" ON public.quiz_attempts FOR ALL USING (
  -- Admins can modify all attempts
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  OR
  -- Users can create/modify their own attempts
  user_id = auth.uid()
);

-- 3. ENHANCED COURSE STRUCTURE POLICIES (if tables exist)
-- =======================================================

DO $$
BEGIN
  -- Add course_modules policies if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'course_modules') THEN
    
    -- Course modules read policy
    EXECUTE 'DROP POLICY IF EXISTS "course_modules_read_policy" ON public.course_modules';
    EXECUTE 'CREATE POLICY "course_modules_read_policy" ON public.course_modules FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = ''admin'')
      OR
      EXISTS (
        SELECT 1 FROM public.courses 
        WHERE courses.id = course_modules.course_id 
        AND courses.instructor_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM public.courses c
        JOIN public.enrollments e ON c.id = e.course_id
        WHERE c.id = course_modules.course_id
        AND c.is_published = true
        AND e.user_id = auth.uid()
      )
    )';
    
    -- Course modules write policy
    EXECUTE 'DROP POLICY IF EXISTS "course_modules_write_policy" ON public.course_modules';
    EXECUTE 'CREATE POLICY "course_modules_write_policy" ON public.course_modules FOR ALL USING (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = ''admin'')
      OR
      EXISTS (
        SELECT 1 FROM public.courses 
        WHERE courses.id = course_modules.course_id 
        AND courses.instructor_id = auth.uid()
      )
    )';
  END IF;

  -- Add course_lessons policies if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'course_lessons') THEN
    
    -- Course lessons read policy
    EXECUTE 'DROP POLICY IF EXISTS "course_lessons_read_policy" ON public.course_lessons';
    EXECUTE 'CREATE POLICY "course_lessons_read_policy" ON public.course_lessons FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = ''admin'')
      OR
      EXISTS (
        SELECT 1 FROM public.courses c
        JOIN public.course_modules cm ON c.id = cm.course_id
        WHERE cm.id = course_lessons.module_id
        AND c.instructor_id = auth.uid()
      )
      OR
      (
        is_published = true 
        AND EXISTS (
          SELECT 1 FROM public.courses c
          JOIN public.course_modules cm ON c.id = cm.course_id
          JOIN public.enrollments e ON c.id = e.course_id
          WHERE cm.id = course_lessons.module_id
          AND c.is_published = true
          AND e.user_id = auth.uid()
        )
      )
      OR
      is_free_preview = true
    )';
    
    -- Course lessons write policy
    EXECUTE 'DROP POLICY IF EXISTS "course_lessons_write_policy" ON public.course_lessons';
    EXECUTE 'CREATE POLICY "course_lessons_write_policy" ON public.course_lessons FOR ALL USING (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = ''admin'')
      OR
      EXISTS (
        SELECT 1 FROM public.courses c
        JOIN public.course_modules cm ON c.id = cm.course_id
        WHERE cm.id = course_lessons.module_id
        AND c.instructor_id = auth.uid()
      )
    )';
  END IF;
END $$;

-- 4. VERIFICATION QUERIES
-- =======================

-- Check that RLS is enabled on core tables
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('courses', 'enrollments', 'quizzes', 'quiz_questions', 'quiz_attempts')
ORDER BY tablename;

-- Check enhanced tables if they exist
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('course_modules', 'course_lessons')
AND EXISTS (SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = pg_tables.tablename)
ORDER BY tablename;

-- Check policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Show summary
SELECT 'RLS policies enabled successfully! Core tables now have proper security.' as status;
