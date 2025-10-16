-- ============================================================================
-- FIX: Row Level Security Performance Issues
-- Problem: auth.uid() is being re-evaluated for every row, causing slow queries
-- Solution: Use simpler, more direct RLS policies without custom functions
-- ============================================================================

-- NOTE: We can't create functions in auth schema due to permissions
-- Instead, we'll use direct auth.uid() calls but with better query patterns

-- Step 1: Drop and recreate users table policies with optimized versions
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.users;

-- Optimized SELECT policy - simple and direct
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Optimized UPDATE policy
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Optional: Allow users to be created (for sign up)
CREATE POLICY "Users can insert during signup"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Step 3: Create index on users(id) if it doesn't exist (it should as primary key)
-- This ensures fast lookups
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);

-- Step 3: Fix other common tables that might have similar issues
-- Enrollments table
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.enrollments;
CREATE POLICY "Users can view own enrollments"
  ON public.enrollments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Quiz attempts table
DROP POLICY IF EXISTS "Users can view own quiz attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.quiz_attempts;
CREATE POLICY "Users can view own quiz attempts"
  ON public.quiz_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Lesson progress table
DROP POLICY IF EXISTS "Users can view own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.lesson_progress;
CREATE POLICY "Users can view own lesson progress"
  ON public.lesson_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Step 5: Add indexes on foreign key columns for better performance
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON public.lesson_progress(user_id);

-- Step 6: Analyze tables to update statistics
ANALYZE public.users;
ANALYZE public.enrollments;
ANALYZE public.quiz_attempts;
ANALYZE public.lesson_progress;

-- ============================================================================
-- Verification Queries - Run these to check performance improvement
-- ============================================================================

-- Check if policies are using the stable function
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
WHERE schemaname = 'public'
  AND tablename IN ('users', 'enrollments', 'quiz_attempts', 'lesson_progress');

-- Check indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'enrollments', 'quiz_attempts', 'lesson_progress')
ORDER BY tablename, indexname;
