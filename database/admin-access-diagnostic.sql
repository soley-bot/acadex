-- =====================================================
-- ADMIN ACCESS DIAGNOSTIC SCRIPT
-- =====================================================
-- Run this in Supabase SQL Editor to diagnose admin access issues
-- =====================================================

-- 1. CHECK CURRENT USER SESSION
-- ============================

SELECT 
  'Current authentication status' as check_type,
  auth.uid() as user_id,
  (auth.uid() IS NOT NULL) as is_authenticated,
  auth.role() as auth_role;

-- 2. CHECK USERS TABLE STRUCTURE
-- ==============================

SELECT 
  'Users table structure' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. LIST ALL USERS AND THEIR ROLES
-- =================================

SELECT 
  'All users in database' as check_type,
  id,
  email,
  name,
  role,
  created_at
FROM public.users
ORDER BY created_at DESC;

-- 4. CHECK FOR ADMIN USERS
-- ========================

SELECT 
  'Admin users count' as check_type,
  COUNT(*) as admin_count
FROM public.users
WHERE role = 'admin';

-- 5. CHECK RLS STATUS ON KEY TABLES
-- =================================

SELECT 
  'RLS status' as check_type,
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'courses', 'enrollments', 'quizzes')
ORDER BY tablename;

-- 6. CHECK HELPER FUNCTIONS EXIST
-- ===============================

SELECT 
  'Helper functions status' as check_type,
  proname as function_name,
  prosecdef as is_security_definer
FROM pg_proc 
WHERE proname IN ('is_admin', 'is_instructor', 'get_user_role')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 7. TEST HELPER FUNCTIONS (if they exist)
-- ========================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
    RAISE NOTICE 'Testing helper functions:';
    RAISE NOTICE 'is_admin(): %', public.is_admin();
    RAISE NOTICE 'is_instructor(): %', public.is_instructor();
    RAISE NOTICE 'get_user_role(): %', public.get_user_role();
  ELSE
    RAISE NOTICE 'Helper functions do not exist - this may be the issue!';
  END IF;
END $$;

-- 8. CHECK COURSES TABLE ACCESS
-- =============================

SELECT 
  'Courses access test' as check_type,
  COUNT(*) as accessible_courses
FROM public.courses;

-- 9. CREATE ADMIN USER IF NEEDED
-- ==============================

-- Uncomment and modify the email below if you need to create an admin user
-- Replace 'your-email@example.com' with your actual email

/*
INSERT INTO public.users (id, email, name, role, created_at, updated_at)
VALUES (
  auth.uid(), -- This will use your current authenticated user ID
  'your-email@example.com', -- Replace with your email
  'Admin User', -- Your name
  'admin', -- Admin role
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  updated_at = NOW();
*/

-- 10. SUMMARY DIAGNOSTIC
-- ======================

SELECT 
  'DIAGNOSTIC SUMMARY' as summary,
  CASE 
    WHEN auth.uid() IS NULL THEN 'NOT AUTHENTICATED - Please log in first'
    WHEN NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()) THEN 'USER RECORD MISSING - User not in database'
    WHEN EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') THEN 'ADMIN ACCESS OK - User has admin role'
    WHEN EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role != 'admin') THEN 'ROLE ISSUE - User exists but not admin'
    ELSE 'UNKNOWN ISSUE - Check above results'
  END as status,
  CASE
    WHEN auth.uid() IS NOT NULL THEN 
      COALESCE((SELECT role FROM public.users WHERE id = auth.uid()), 'NO_RECORD')
    ELSE 'NOT_AUTHENTICATED'
  END as current_role;
