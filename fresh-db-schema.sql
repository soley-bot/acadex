-- ============================================================================
-- FRESH DATABASE SCHEMA - Clean Start with Optimized RLS
-- Run this to create a brand new, fast database structure
-- ============================================================================

-- Step 1: Drop existing policies (clean slate)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert during signup" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.users;

-- Step 2: DISABLE RLS temporarily to verify it works
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 3: If you want to re-enable RLS later (after testing), use these optimized policies:
-- NOTE: Only uncomment these AFTER confirming auth works without RLS

/*
-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Super simple policies - no complex conditions
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());
*/

-- Step 4: Create essential indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Step 5: Do the same for other user-related tables
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress DISABLE ROW LEVEL SECURITY;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON public.lesson_progress(user_id);

-- Step 6: Verify RLS is disabled
SELECT
  tablename,
  CASE
    WHEN rowsecurity THEN 'ENABLED'
    ELSE 'DISABLED'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'enrollments', 'quiz_attempts', 'lesson_progress');

-- ============================================================================
-- NEXT STEPS:
-- 1. Run this SQL
-- 2. Refresh your browser
-- 3. Try to sign in - it should work INSTANTLY
-- 4. Once confirmed working, you can gradually re-enable RLS with the optimized
--    policies (uncomment the section in Step 3)
-- ============================================================================
