-- =====================================================
-- COMPLETE RLS POLICY CLEANUP AND REBUILD
-- =====================================================
-- This script completely removes all existing RLS policies and rebuilds them
-- to eliminate infinite recursion issues
-- =====================================================

-- 1. DISABLE RLS ON ALL TABLES TEMPORARILY
-- ========================================

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts DISABLE ROW LEVEL SECURITY;

-- Disable RLS on enhanced tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'course_modules') THEN
    ALTER TABLE public.course_modules DISABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'course_lessons') THEN
    ALTER TABLE public.course_lessons DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 2. DROP ALL EXISTING POLICIES TO START FRESH
-- ============================================

-- Drop all courses policies
DROP POLICY IF EXISTS "Courses are public if published" ON public.courses;
DROP POLICY IF EXISTS "Instructors can manage their own courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can manage all courses" ON public.courses;
DROP POLICY IF EXISTS "Published courses are publicly readable" ON public.courses;
DROP POLICY IF EXISTS "Instructors can manage their courses" ON public.courses;
DROP POLICY IF EXISTS "courses_read_policy" ON public.courses;
DROP POLICY IF EXISTS "courses_write_policy" ON public.courses;
DROP POLICY IF EXISTS "Anyone can view active courses" ON public.courses;

-- Drop all enrollments policies
DROP POLICY IF EXISTS "Users can view their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can create their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can update their own enrollment progress" ON public.enrollments;
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can create own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can update own enrollment progress" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_read_policy" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_write_policy" ON public.enrollments;
DROP POLICY IF EXISTS "Users can enroll in courses" ON public.enrollments;
DROP POLICY IF EXISTS "Users can update their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can delete enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can delete own enrollments" ON public.enrollments;

-- Drop all quizzes policies
DROP POLICY IF EXISTS "Quizzes are public if published" ON public.quizzes;
DROP POLICY IF EXISTS "Admins and instructors can manage quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Anyone can view active quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Course instructors can manage quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Anyone can view published quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admin users can manage all quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Authenticated users can view all quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "quizzes_read_policy" ON public.quizzes;
DROP POLICY IF EXISTS "quizzes_write_policy" ON public.quizzes;

-- Drop all quiz_questions policies
DROP POLICY IF EXISTS "Quiz questions are public for published quizzes" ON public.quiz_questions;
DROP POLICY IF EXISTS "Admins and instructors can manage quiz questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Anyone can view questions for active quizzes" ON public.quiz_questions;
DROP POLICY IF EXISTS "Anyone can view questions for published quizzes" ON public.quiz_questions;
DROP POLICY IF EXISTS "Admin users can manage all quiz questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Quiz owners can manage questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "quiz_questions_read_policy" ON public.quiz_questions;
DROP POLICY IF EXISTS "quiz_questions_write_policy" ON public.quiz_questions;

-- Drop all quiz_attempts policies
DROP POLICY IF EXISTS "Users can view their own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can create their own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Admin users can view all quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "quiz_attempts_read_policy" ON public.quiz_attempts;
DROP POLICY IF EXISTS "quiz_attempts_write_policy" ON public.quiz_attempts;

-- Drop all users policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can view instructor profiles" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Admin users can view all users" ON public.users;

-- Drop enhanced table policies if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'course_modules') THEN
    EXECUTE 'DROP POLICY IF EXISTS "course_modules_read_policy" ON public.course_modules';
    EXECUTE 'DROP POLICY IF EXISTS "course_modules_write_policy" ON public.course_modules';
    EXECUTE 'DROP POLICY IF EXISTS "Course modules readable by enrolled users" ON public.course_modules';
    EXECUTE 'DROP POLICY IF EXISTS "Admin can manage all course modules" ON public.course_modules';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view published course modules" ON public.course_modules';
    EXECUTE 'DROP POLICY IF EXISTS "Enrolled users can view course modules" ON public.course_modules';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'course_lessons') THEN
    EXECUTE 'DROP POLICY IF EXISTS "course_lessons_read_policy" ON public.course_lessons';
    EXECUTE 'DROP POLICY IF EXISTS "course_lessons_write_policy" ON public.course_lessons';
    EXECUTE 'DROP POLICY IF EXISTS "Admin can manage all course lessons" ON public.course_lessons';
    EXECUTE 'DROP POLICY IF EXISTS "Users can view published lessons" ON public.course_lessons';
  END IF;
END $$;

-- 3. CREATE SECURITY DEFINER HELPER FUNCTIONS
-- ===========================================

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

-- 4. RE-ENABLE RLS ON ALL TABLES (EXCEPT USERS)
-- =============================================

-- Keep users table RLS disabled to prevent recursion
-- Other tables will use helper functions for role checks

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS on enhanced tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'course_modules') THEN
    ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'course_lessons') THEN
    ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 5. CREATE NEW CLEAN POLICIES
-- ============================

-- COURSES POLICIES
-- ================

CREATE POLICY "courses_read_policy" ON public.courses FOR SELECT USING (
  public.is_admin()
  OR
  instructor_id = auth.uid()
  OR
  is_published = true
);

CREATE POLICY "courses_write_policy" ON public.courses FOR ALL USING (
  public.is_admin()
  OR
  instructor_id = auth.uid()
);

-- ENROLLMENTS POLICIES (Simple - no circular dependencies)
-- ====================

CREATE POLICY "enrollments_read_policy" ON public.enrollments FOR SELECT USING (
  public.is_admin()
  OR
  user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = enrollments.course_id 
    AND courses.instructor_id = auth.uid()
  )
);

CREATE POLICY "enrollments_write_policy" ON public.enrollments FOR ALL USING (
  public.is_admin()
  OR
  user_id = auth.uid()
);

-- QUIZZES POLICIES
-- ================

CREATE POLICY "quizzes_read_policy" ON public.quizzes FOR SELECT USING (
  public.is_admin()
  OR
  public.is_instructor()
  OR
  (is_published = true AND auth.role() = 'authenticated')
);

CREATE POLICY "quizzes_write_policy" ON public.quizzes FOR ALL USING (
  public.is_admin()
  OR
  public.is_instructor()
);

-- QUIZ_QUESTIONS POLICIES
-- =======================

CREATE POLICY "quiz_questions_read_policy" ON public.quiz_questions FOR SELECT USING (
  public.is_admin()
  OR
  public.is_instructor()
  OR
  EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_questions.quiz_id
    AND q.is_published = true
    AND auth.role() = 'authenticated'
  )
);

CREATE POLICY "quiz_questions_write_policy" ON public.quiz_questions FOR ALL USING (
  public.is_admin()
  OR
  public.is_instructor()
);

-- QUIZ ATTEMPTS POLICIES
-- ======================

CREATE POLICY "quiz_attempts_read_policy" ON public.quiz_attempts FOR SELECT USING (
  public.is_admin()
  OR
  public.is_instructor()
  OR
  user_id = auth.uid()
);

CREATE POLICY "quiz_attempts_write_policy" ON public.quiz_attempts FOR ALL USING (
  public.is_admin()
  OR
  user_id = auth.uid()
);

-- 6. ENHANCED COURSE STRUCTURE POLICIES (if tables exist)
-- =======================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'course_modules') THEN
    
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

  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'course_lessons') THEN
    
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

-- 7. VERIFICATION
-- ===============

-- Check RLS status
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
  'RLS policies completely rebuilt!' as status,
  public.get_user_role() as current_user_role,
  public.is_admin() as is_admin,
  public.is_instructor() as is_instructor;

-- Count policies
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
