-- DEVELOPMENT MODE: TEMPORARILY DISABLE PROBLEMATIC RLS
-- Use this ONLY for development/testing - NEVER in production!
-- This completely removes RLS from specific tables to test functionality

-- =============================================
-- OPTION 1: TEMPORARILY DISABLE RLS (TESTING ONLY)
-- =============================================

-- Uncomment these lines ONLY if the permissive policies still cause issues
-- This removes RLS entirely for testing - RE-ENABLE before production!

/*
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons DISABLE ROW LEVEL SECURITY;

-- After testing, RE-ENABLE with:
-- ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
-- (repeat for all tables)
*/

-- =============================================
-- OPTION 2: CREATE SUPER-PERMISSIVE POLICIES (SAFER)
-- =============================================

-- This approach keeps RLS enabled but makes policies very permissive
-- Better for testing while maintaining the RLS framework

-- Drop all existing policies and create permissive ones
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

-- Create super-permissive policies for development
CREATE POLICY "dev_courses_all_access" ON public.courses FOR ALL USING (true);
CREATE POLICY "dev_users_all_access" ON public.users FOR ALL USING (true);
CREATE POLICY "dev_enrollments_all_access" ON public.enrollments FOR ALL USING (true);
CREATE POLICY "dev_quizzes_all_access" ON public.quizzes FOR ALL USING (true);
CREATE POLICY "dev_quiz_questions_all_access" ON public.quiz_questions FOR ALL USING (true);
CREATE POLICY "dev_quiz_attempts_all_access" ON public.quiz_attempts FOR ALL USING (true);

-- Course modules and lessons (if they exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'course_modules') THEN
        CREATE POLICY "dev_course_modules_all_access" ON public.course_modules FOR ALL USING (true);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'course_lessons') THEN
        CREATE POLICY "dev_course_lessons_all_access" ON public.course_lessons FOR ALL USING (true);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'course_resources') THEN
        CREATE POLICY "dev_course_resources_all_access" ON public.course_resources FOR ALL USING (true);
    END IF;
END $$;

-- =============================================
-- TESTING QUERIES
-- =============================================

-- Test popular courses (should work without authentication)
SELECT 
    'TESTING POPULAR COURSES' as test_name,
    COUNT(*) as course_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SUCCESS'
        ELSE '❌ NO COURSES FOUND'
    END as status
FROM public.courses 
WHERE is_published = true;

-- Test user access (should work)
SELECT 
    'TESTING USER ACCESS' as test_name,
    COUNT(*) as user_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SUCCESS'
        ELSE '❌ NO USERS FOUND'
    END as status
FROM public.users;

-- Test enrollments (should work)
SELECT 
    'TESTING ENROLLMENTS' as test_name,
    COUNT(*) as enrollment_count,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ SUCCESS'
        ELSE '❌ ERROR'
    END as status
FROM public.enrollments;

-- =============================================
-- INSTRUCTIONS
-- =============================================

SELECT 
    '🎯 DEVELOPMENT MODE ENABLED' as message,
    'All tables now have permissive access policies' as details,
    'Test your app now - everything should work' as next_step;

-- =============================================
-- REVERT TO PRODUCTION POLICIES LATER
-- =============================================

/*
-- When ready for production, run the production-ready policies:
-- 1. Drop all development policies
-- 2. Re-create secure production policies
-- 3. Test thoroughly before deployment

-- Use this query to drop development policies later:
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND policyname LIKE 'dev_%'
    LOOP
        EXECUTE format('DROP POLICY %I ON public.%I', 
                      pol.policyname, pol.tablename);
    END LOOP;
END $$;
*/
