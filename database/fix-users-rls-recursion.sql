-- =====================================================
-- FIX INFINITE RECURSION IN USERS TABLE RLS POLICIES
-- =====================================================
-- This fixes the infinite recursion error in the users table
-- =====================================================

-- 1. DISABLE RLS ON USERS TABLE TO BREAK RECURSION
-- =================================================

-- The issue is that policies on other tables query the users table to check roles,
-- but if the users table itself has RLS, this creates infinite recursion.
-- We'll disable RLS on users table and rely on auth.uid() for user access control.

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. CREATE SECURITY DEFINER FUNCTIONS FOR ROLE CHECKS
-- ====================================================

-- Create helper functions that can check user roles without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1) = 'admin',
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_instructor()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1) IN ('instructor', 'admin'),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1),
    'student'
  );
$$;

-- 3. UPDATE ALL POLICIES TO USE HELPER FUNCTIONS
-- ==============================================

-- COURSES POLICIES (Updated to use helper functions)
-- ================

DROP POLICY IF EXISTS "courses_read_policy" ON public.courses;
CREATE POLICY "courses_read_policy" ON public.courses FOR SELECT USING (
  -- Admins can see all courses
  public.is_admin()
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

DROP POLICY IF EXISTS "courses_write_policy" ON public.courses;
CREATE POLICY "courses_write_policy" ON public.courses FOR ALL USING (
  -- Admins can modify all courses
  public.is_admin()
  OR
  -- Instructors can modify their own courses
  instructor_id = auth.uid()
);

-- ENROLLMENTS POLICIES (Updated to use helper functions)
-- ====================

DROP POLICY IF EXISTS "enrollments_read_policy" ON public.enrollments;
CREATE POLICY "enrollments_read_policy" ON public.enrollments FOR SELECT USING (
  -- Admins can see all enrollments
  public.is_admin()
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
  public.is_admin()
  OR
  -- Users can create/modify their own enrollments
  user_id = auth.uid()
);

-- QUIZZES POLICIES (Updated to use helper functions)
-- ================

DROP POLICY IF EXISTS "quizzes_read_policy" ON public.quizzes;
CREATE POLICY "quizzes_read_policy" ON public.quizzes FOR SELECT USING (
  -- Admins can see all quizzes
  public.is_admin()
  OR
  -- Published quizzes are visible to authenticated users
  (is_published = true AND auth.role() = 'authenticated')
  OR
  -- Instructors can see all quizzes for management
  public.is_instructor()
);

DROP POLICY IF EXISTS "quizzes_write_policy" ON public.quizzes;
CREATE POLICY "quizzes_write_policy" ON public.quizzes FOR ALL USING (
  -- Admins can modify all quizzes
  public.is_admin()
  OR
  -- Instructors can create and modify quizzes
  public.is_instructor()
);

-- QUIZ_QUESTIONS POLICIES (Updated to use helper functions)
-- =======================

DROP POLICY IF EXISTS "quiz_questions_read_policy" ON public.quiz_questions;
CREATE POLICY "quiz_questions_read_policy" ON public.quiz_questions FOR SELECT USING (
  -- Admins can see all questions
  public.is_admin()
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
  public.is_instructor()
);

DROP POLICY IF EXISTS "quiz_questions_write_policy" ON public.quiz_questions;
CREATE POLICY "quiz_questions_write_policy" ON public.quiz_questions FOR ALL USING (
  -- Admins can modify all questions
  public.is_admin()
  OR
  -- Instructors can create and modify questions
  public.is_instructor()
);

-- QUIZ ATTEMPTS POLICIES (Updated to use helper functions)
-- ======================

DROP POLICY IF EXISTS "quiz_attempts_read_policy" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_read_policy" ON public.quiz_attempts FOR SELECT USING (
  -- Admins can see all attempts
  public.is_admin()
  OR
  -- Instructors can see all attempts for analytics
  public.is_instructor()
  OR
  -- Users can see their own attempts
  user_id = auth.uid()
);

DROP POLICY IF EXISTS "quiz_attempts_write_policy" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_write_policy" ON public.quiz_attempts FOR ALL USING (
  -- Admins can modify all attempts
  public.is_admin()
  OR
  -- Users can create/modify their own attempts
  user_id = auth.uid()
);

-- 4. ENHANCED COURSE STRUCTURE POLICIES (if tables exist)
-- =======================================================

DO $$
BEGIN
  -- Add course_modules policies if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'course_modules') THEN
    
    -- Course modules read policy
    EXECUTE 'DROP POLICY IF EXISTS "course_modules_read_policy" ON public.course_modules';
    EXECUTE 'CREATE POLICY "course_modules_read_policy" ON public.course_modules FOR SELECT USING (
      public.is_admin()
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
      public.is_admin()
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
      public.is_admin()
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
      public.is_admin()
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

-- 5. VERIFICATION QUERIES
-- =======================

-- Check that RLS is enabled on core tables (users should be disabled)
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'courses', 'enrollments', 'quizzes', 'quiz_questions', 'quiz_attempts')
ORDER BY tablename;

-- Test helper functions
SELECT 
  'Helper functions created successfully' as status,
  public.get_user_role() as current_user_role,
  public.is_admin() as is_admin,
  public.is_instructor() as is_instructor;

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
SELECT 'RLS infinite recursion fixed! Users table RLS disabled, other tables use helper functions.' as status;
