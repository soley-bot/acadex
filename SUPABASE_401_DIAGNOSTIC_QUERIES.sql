-- SUPABASE 401 AUTHENTICATION DIAGNOSTIC QUERIES
-- Run these in your Supabase SQL Editor to identify authentication issues

-- 1. Check if auth.users table has admin users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  last_sign_in_at
FROM auth.users 
WHERE email LIKE '%admin%' OR email IN (
  'admin@acadex.com', 
  'test@admin.com',
  'your-admin-email@domain.com'  -- Replace with your actual admin email
)
ORDER BY created_at DESC;

-- 2. Check if users table exists and has role information
SELECT 
  u.id,
  u.email,
  p.role,
  p.name,
  p.created_at
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE u.email LIKE '%admin%'
ORDER BY u.created_at DESC;

-- 3. Check Row Level Security (RLS) policies on enrollments table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'enrollments';

-- 4. Check if enrollments table exists and has proper structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'enrollments' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check RLS policies on users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 6. Check if RLS is enabled on critical tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'enrollments', 'courses', 'quizzes')
ORDER BY tablename;

-- 7. Test admin access to enrollments (should work with service role)
-- This will show if there are any enrollments at all
SELECT COUNT(*) as total_enrollments FROM enrollments;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_courses FROM courses;

-- 8. Check for any permission/grant issues
SELECT 
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'enrollments', 'courses')
  AND grantee IN ('postgres', 'anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee;

-- 9. Check auth schema permissions
SELECT 
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'auth' 
  AND table_name = 'users'
ORDER BY grantee;

-- 10. Look for any admin-specific database functions or triggers
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND (routine_name LIKE '%admin%' OR routine_name LIKE '%auth%')
ORDER BY routine_name;

-- POTENTIAL FIXES TO TRY:

-- Fix 1: Ensure RLS allows service_role access to enrollments
-- ALTER TABLE enrollments FORCE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Service role can access all enrollments" ON enrollments;
-- CREATE POLICY "Service role can access all enrollments" ON enrollments
--   FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Fix 2: Ensure admin users have proper role in users table
-- UPDATE users SET role = 'admin' 
-- WHERE id IN (
--   SELECT id FROM auth.users 
--   WHERE email = 'your-admin-email@domain.com'
-- );

-- Fix 3: Grant necessary permissions to service_role
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
-- GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Fix 4: Create admin policy for enrollments if missing
-- CREATE POLICY "Admin users can manage all enrollments" ON enrollments
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE users.id = auth.uid() 
--       AND users.role = 'admin'
--     )
--   );
