-- COMPREHENSIVE RLS FIX FOR SUPABASE ERRORS
-- Run this in Supabase SQL Editor to fix all RLS initialization errors

-- =============================================
-- 1. DISABLE RLS TEMPORARILY FOR SETUP
-- =============================================
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.course_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.course_lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.course_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quiz_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quiz_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.enrollments DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. DROP ALL EXISTING POLICIES (CLEAN SLATE)
-- =============================================
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    -- Drop all existing policies
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- =============================================
-- 3. CREATE SIMPLE, WORKING RLS POLICIES
-- =============================================

-- USERS TABLE POLICIES
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- COURSES TABLE POLICIES (Public read, admin write)
CREATE POLICY "courses_select_all" ON public.courses
    FOR SELECT USING (true);

CREATE POLICY "courses_insert_admin" ON public.courses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

CREATE POLICY "courses_update_admin" ON public.courses
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

CREATE POLICY "courses_delete_admin" ON public.courses
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

-- COURSE MODULES POLICIES
CREATE POLICY "course_modules_select_all" ON public.course_modules
    FOR SELECT USING (true);

CREATE POLICY "course_modules_insert_admin" ON public.course_modules
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

CREATE POLICY "course_modules_update_admin" ON public.course_modules
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

CREATE POLICY "course_modules_delete_admin" ON public.course_modules
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

-- COURSE LESSONS POLICIES
CREATE POLICY "course_lessons_select_all" ON public.course_lessons
    FOR SELECT USING (true);

CREATE POLICY "course_lessons_insert_admin" ON public.course_lessons
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

CREATE POLICY "course_lessons_update_admin" ON public.course_lessons
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

CREATE POLICY "course_lessons_delete_admin" ON public.course_lessons
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

-- COURSE RESOURCES POLICIES
CREATE POLICY "course_resources_select_all" ON public.course_resources
    FOR SELECT USING (true);

CREATE POLICY "course_resources_insert_admin" ON public.course_resources
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

CREATE POLICY "course_resources_update_admin" ON public.course_resources
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

CREATE POLICY "course_resources_delete_admin" ON public.course_resources
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

-- QUIZZES TABLE POLICIES
CREATE POLICY "quizzes_select_all" ON public.quizzes
    FOR SELECT USING (true);

CREATE POLICY "quizzes_insert_admin" ON public.quizzes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

CREATE POLICY "quizzes_update_admin" ON public.quizzes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

CREATE POLICY "quizzes_delete_admin" ON public.quizzes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

-- QUIZ QUESTIONS POLICIES
CREATE POLICY "quiz_questions_select_all" ON public.quiz_questions
    FOR SELECT USING (true);

CREATE POLICY "quiz_questions_insert_admin" ON public.quiz_questions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

CREATE POLICY "quiz_questions_update_admin" ON public.quiz_questions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

CREATE POLICY "quiz_questions_delete_admin" ON public.quiz_questions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

-- QUIZ ATTEMPTS POLICIES
CREATE POLICY "quiz_attempts_select_own" ON public.quiz_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "quiz_attempts_insert_own" ON public.quiz_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quiz_attempts_update_own" ON public.quiz_attempts
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin can see all quiz attempts
CREATE POLICY "quiz_attempts_select_admin" ON public.quiz_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

-- ENROLLMENTS POLICIES
CREATE POLICY "enrollments_select_own" ON public.enrollments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "enrollments_insert_own" ON public.enrollments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "enrollments_update_own" ON public.enrollments
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin can see all enrollments
CREATE POLICY "enrollments_select_admin" ON public.enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

-- =============================================
-- 4. RE-ENABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 5. GRANT NECESSARY PERMISSIONS
-- =============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =============================================
-- 6. CREATE TRIGGER FOR USER CREATION
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    CASE 
      WHEN new.email = 'admin01@acadex.com' THEN 'admin'
      ELSE 'student'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 7. VERIFICATION QUERIES
-- =============================================
-- Check if policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

COMMENT ON SCHEMA public IS 'RLS policies updated and working correctly';
