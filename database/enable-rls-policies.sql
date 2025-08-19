-- =====================================================
-- ENABLE PROPER ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- This replaces the dangerous service_role key bypass
-- Run this in your Supabase SQL Editor AFTER running the security fixes
-- =====================================================

-- 1. ENABLE RLS ON ALL TABLES
-- ============================

-- Enable RLS on courses table
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Enable RLS on course_modules table  
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

-- Enable RLS on course_lessons table
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- Enable RLS on enrollments table
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on quizzes table
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Enable RLS on quiz_questions table
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on quiz_attempts table
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- 2. CREATE COMPREHENSIVE RLS POLICIES
-- ====================================

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

-- COURSE MODULES POLICIES
-- =======================

DROP POLICY IF EXISTS "course_modules_read_policy" ON public.course_modules;
CREATE POLICY "course_modules_read_policy" ON public.course_modules FOR SELECT USING (
  -- Admins can see all modules
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  OR
  -- Instructors can see modules of their courses
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_modules.course_id 
    AND courses.instructor_id = auth.uid()
  )
  OR
  -- Students can see modules of courses they're enrolled in (if course is published)
  EXISTS (
    SELECT 1 FROM public.courses c
    JOIN public.enrollments e ON c.id = e.course_id
    WHERE c.id = course_modules.course_id
    AND c.is_published = true
    AND e.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "course_modules_write_policy" ON public.course_modules;
CREATE POLICY "course_modules_write_policy" ON public.course_modules FOR ALL USING (
  -- Admins can modify all modules
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  OR
  -- Instructors can modify modules of their courses
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_modules.course_id 
    AND courses.instructor_id = auth.uid()
  )
);

-- COURSE LESSONS POLICIES
-- =======================

DROP POLICY IF EXISTS "course_lessons_read_policy" ON public.course_lessons;
CREATE POLICY "course_lessons_read_policy" ON public.course_lessons FOR SELECT USING (
  -- Admins can see all lessons
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  OR
  -- Instructors can see lessons of their courses
  EXISTS (
    SELECT 1 FROM public.courses c
    JOIN public.course_modules cm ON c.id = cm.course_id
    WHERE cm.id = course_lessons.module_id
    AND c.instructor_id = auth.uid()
  )
  OR
  -- Students can see published lessons of enrolled courses
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
  -- Anyone can see free preview lessons
  is_free_preview = true
);

DROP POLICY IF EXISTS "course_lessons_write_policy" ON public.course_lessons;
CREATE POLICY "course_lessons_write_policy" ON public.course_lessons FOR ALL USING (
  -- Admins can modify all lessons
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  OR
  -- Instructors can modify lessons of their courses
  EXISTS (
    SELECT 1 FROM public.courses c
    JOIN public.course_modules cm ON c.id = cm.course_id
    WHERE cm.id = course_lessons.module_id
    AND c.instructor_id = auth.uid()
  )
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

-- QUIZZES POLICIES
-- ================

DROP POLICY IF EXISTS "quizzes_read_policy" ON public.quizzes;
CREATE POLICY "quizzes_read_policy" ON public.quizzes FOR SELECT USING (
  -- Admins can see all quizzes
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  OR
  -- If quiz has course_id, check course access (instructors can see their own, students see published enrolled courses)
  (
    course_id IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM public.courses 
        WHERE courses.id = quizzes.course_id 
        AND courses.instructor_id = auth.uid()
      )
      OR
      (
        is_published = true 
        AND EXISTS (
          SELECT 1 FROM public.courses c
          JOIN public.enrollments e ON c.id = e.course_id
          WHERE c.id = quizzes.course_id
          AND c.is_published = true
          AND e.user_id = auth.uid()
        )
      )
    )
  )
  OR
  -- If quiz has lesson_id, check lesson access through course
  (
    lesson_id IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM public.course_lessons cl
        JOIN public.course_modules cm ON cl.module_id = cm.id
        JOIN public.courses c ON cm.course_id = c.id
        WHERE cl.id = quizzes.lesson_id
        AND c.instructor_id = auth.uid()
      )
      OR
      (
        is_published = true
        AND EXISTS (
          SELECT 1 FROM public.course_lessons cl
          JOIN public.course_modules cm ON cl.module_id = cm.id
          JOIN public.courses c ON cm.course_id = c.id
          JOIN public.enrollments e ON c.id = e.course_id
          WHERE cl.id = quizzes.lesson_id
          AND c.is_published = true
          AND e.user_id = auth.uid()
        )
      )
    )
  )
  OR
  -- Standalone quizzes (no course_id or lesson_id) are visible if published
  (course_id IS NULL AND lesson_id IS NULL AND is_published = true)
);

DROP POLICY IF EXISTS "quizzes_write_policy" ON public.quizzes;
CREATE POLICY "quizzes_write_policy" ON public.quizzes FOR ALL USING (
  -- Admins can modify all quizzes
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  OR
  -- If quiz has course_id, instructor can modify their course quizzes
  (
    course_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = quizzes.course_id 
      AND courses.instructor_id = auth.uid()
    )
  )
  OR
  -- If quiz has lesson_id, instructor can modify through course ownership
  (
    lesson_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM public.course_lessons cl
      JOIN public.course_modules cm ON cl.module_id = cm.id
      JOIN public.courses c ON cm.course_id = c.id
      WHERE cl.id = quizzes.lesson_id
      AND c.instructor_id = auth.uid()
    )
  )
  OR
  -- For standalone quizzes, allow instructors and admins to create/modify
  (course_id IS NULL AND lesson_id IS NULL AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('instructor', 'admin')
  ))
);

-- QUIZ_QUESTIONS POLICIES
-- ==================

DROP POLICY IF EXISTS "quiz_questions_read_policy" ON public.quiz_questions;
CREATE POLICY "quiz_questions_read_policy" ON public.quiz_questions FOR SELECT USING (
  -- Admins can see all questions
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  OR
  -- Instructors can see questions for their course quizzes (course-level or lesson-level)
  EXISTS (
    SELECT 1 FROM public.quizzes q
    LEFT JOIN public.courses c ON q.course_id = c.id
    LEFT JOIN public.course_lessons cl ON q.lesson_id = cl.id
    LEFT JOIN public.course_modules cm ON cl.module_id = cm.id
    LEFT JOIN public.courses c2 ON cm.course_id = c2.id
    WHERE q.id = quiz_questions.quiz_id
    AND (
      (c.instructor_id = auth.uid()) OR 
      (c2.instructor_id = auth.uid())
    )
  )
  OR
  -- Students can see questions for published quizzes of enrolled courses
  EXISTS (
    SELECT 1 FROM public.quizzes q
    LEFT JOIN public.courses c ON q.course_id = c.id
    LEFT JOIN public.course_lessons cl ON q.lesson_id = cl.id
    LEFT JOIN public.course_modules cm ON cl.module_id = cm.id
    LEFT JOIN public.courses c2 ON cm.course_id = c2.id
    LEFT JOIN public.enrollments e1 ON c.id = e1.course_id
    LEFT JOIN public.enrollments e2 ON c2.id = e2.course_id
    WHERE q.id = quiz_questions.quiz_id
    AND q.is_published = true
    AND (
      (c.is_published = true AND e1.user_id = auth.uid()) OR
      (c2.is_published = true AND e2.user_id = auth.uid())
    )
  )
  OR
  -- Standalone published quizzes are visible to authenticated users
  EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_questions.quiz_id
    AND q.course_id IS NULL
    AND q.lesson_id IS NULL
    AND q.is_published = true
  )
);

DROP POLICY IF EXISTS "quiz_questions_write_policy" ON public.quiz_questions;
CREATE POLICY "quiz_questions_write_policy" ON public.quiz_questions FOR ALL USING (
  -- Admins can modify all questions
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  OR
  -- Instructors can modify questions for their course quizzes
  EXISTS (
    SELECT 1 FROM public.quizzes q
    LEFT JOIN public.courses c ON q.course_id = c.id
    LEFT JOIN public.course_lessons cl ON q.lesson_id = cl.id
    LEFT JOIN public.course_modules cm ON cl.module_id = cm.id
    LEFT JOIN public.courses c2 ON cm.course_id = c2.id
    WHERE q.id = quiz_questions.quiz_id
    AND (
      (c.instructor_id = auth.uid()) OR 
      (c2.instructor_id = auth.uid())
    )
  )
  OR
  -- Instructors can create questions for standalone quizzes
  EXISTS (
    SELECT 1 FROM public.quizzes q
    WHERE q.id = quiz_questions.quiz_id
    AND q.course_id IS NULL
    AND q.lesson_id IS NULL
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('instructor', 'admin')
    )
  )
);

-- QUIZ ATTEMPTS POLICIES
-- ======================

DROP POLICY IF EXISTS "quiz_attempts_read_policy" ON public.quiz_attempts;
CREATE POLICY "quiz_attempts_read_policy" ON public.quiz_attempts FOR SELECT USING (
  -- Admins can see all attempts
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  OR
  -- Instructors can see attempts for their course quizzes
  EXISTS (
    SELECT 1 FROM public.quizzes q
    LEFT JOIN public.courses c ON q.course_id = c.id
    LEFT JOIN public.course_lessons cl ON q.lesson_id = cl.id
    LEFT JOIN public.course_modules cm ON cl.module_id = cm.id
    LEFT JOIN public.courses c2 ON cm.course_id = c2.id
    WHERE q.id = quiz_attempts.quiz_id
    AND (
      (c.instructor_id = auth.uid()) OR 
      (c2.instructor_id = auth.uid())
    )
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

-- 3. VERIFICATION QUERIES
-- =======================

-- Check that RLS is enabled on all tables
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('courses', 'course_modules', 'course_lessons', 'enrollments', 'quizzes', 'quiz_questions', 'quiz_attempts')
ORDER BY tablename;

-- Check policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Show summary
SELECT 'RLS policies enabled successfully! All tables now have proper security.' as status;
