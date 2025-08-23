-- SUPABASE 401 AUTHENTICATION FIXES
-- Run these queries in order to fix the authentication issues

-- ====================
-- STEP 1: ENABLE RLS ON CRITICAL TABLES
-- ====================

-- Enable RLS on users table (this was disabled according to Security Advisor)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on enrollments table if not already enabled
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on courses table if not already enabled  
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- ====================
-- STEP 2: CREATE/UPDATE SERVICE ROLE POLICIES
-- ====================

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Service role can access all enrollments" ON enrollments;
DROP POLICY IF EXISTS "Service role can access all users" ON users;
DROP POLICY IF EXISTS "Service role can access all courses" ON courses;

-- Create service role policies for full access (needed for admin APIs)
CREATE POLICY "Service role can access all enrollments" ON enrollments
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can access all users" ON users
  FOR ALL 
  TO service_role  
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can access all courses" ON courses
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ====================
-- STEP 3: CREATE ADMIN USER POLICIES 
-- ====================

-- Admin users can access all enrollments
DROP POLICY IF EXISTS "Admin users can manage all enrollments" ON enrollments;
CREATE POLICY "Admin users can manage all enrollments" ON enrollments
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admin users can access all user records
DROP POLICY IF EXISTS "Admin users can manage all users" ON users;
CREATE POLICY "Admin users can manage all users" ON users
  FOR ALL 
  TO authenticated
  USING (
    users.id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM users u2 
      WHERE u2.id = auth.uid() 
      AND u2.role = 'admin'
    )
  )
  WITH CHECK (
    users.id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM users u2 
      WHERE u2.id = auth.uid() 
      AND u2.role = 'admin'
    )
  );

-- ====================
-- STEP 4: VERIFY/CREATE is_admin FUNCTION
-- ====================

-- Drop and recreate is_admin function with proper permissions
-- First drop any existing versions
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_admin(uuid);
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Create the function with explicit schema and unique signature
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = user_id 
    AND role = 'admin'
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon;

-- ====================
-- STEP 5: VERIFY ADMIN USERS EXIST
-- ====================

-- Check if any admin users exist
DO $$
DECLARE
    admin_count integer;
BEGIN
    SELECT COUNT(*) INTO admin_count 
    FROM users 
    WHERE role = 'admin';
    
    IF admin_count = 0 THEN
        RAISE NOTICE 'WARNING: No admin users found! You need to set at least one user as admin.';
        RAISE NOTICE 'Run: UPDATE users SET role = ''admin'' WHERE email = ''your-email@domain.com'';';
    ELSE
        RAISE NOTICE 'Found % admin user(s)', admin_count;
    END IF;
END $$;

-- ====================
-- STEP 6: GRANT NECESSARY PERMISSIONS
-- ====================

-- Ensure service_role has all necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Ensure authenticated users can read basic data
GRANT SELECT ON users TO authenticated;
GRANT SELECT ON courses TO authenticated;
GRANT SELECT ON enrollments TO authenticated;

-- ====================
-- STEP 7: TEST QUERIES (run these to verify fixes)
-- ====================

-- Test 1: Check if RLS is now enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'enrollments', 'courses')
ORDER BY tablename;

-- Test 2: Check admin function works
SELECT is_admin() as current_user_is_admin;

-- Test 3: Check policies exist
SELECT 
  tablename,
  policyname,
  roles
FROM pg_policies 
WHERE tablename IN ('users', 'enrollments', 'courses')
  AND roles @> ARRAY['service_role']
ORDER BY tablename, policyname;

-- ====================
-- MANUAL STEPS NEEDED:
-- ====================

-- 1. Set your email as admin (replace with your actual email):
-- UPDATE users SET role = 'admin' WHERE email = 'your-actual-admin-email@domain.com';

-- 2. If you don't have a user record, create one:
-- INSERT INTO users (id, email, role, name) 
-- SELECT id, email, 'admin', 'Admin User'
-- FROM auth.users 
-- WHERE email = 'your-actual-admin-email@domain.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';
