-- =====================================================
-- ACADEX PERFORMANCE INDEXES - SUPABASE SQL EDITOR VERSION
-- Run these commands ONE AT A TIME in Supabase SQL Editor
-- DO NOT run them all together in one transaction
-- =====================================================

-- 🔥 CRITICAL INDEX 1: Quiz Management Optimization
-- Copy and paste this command, then click RUN
CREATE INDEX IF NOT EXISTS idx_quizzes_published_category_created 
ON quizzes(is_published, category, created_at DESC)
WHERE is_published = true;

-- 🔥 CRITICAL INDEX 2: Course Listing Optimization  
-- Copy and paste this command, then click RUN
CREATE INDEX IF NOT EXISTS idx_courses_published_category_created 
ON courses(is_published, category, created_at DESC)
WHERE is_published = true;

-- 🔥 CRITICAL INDEX 3: Admin Dashboard User Analytics (SIMPLIFIED)
-- Copy and paste this command, then click RUN
CREATE INDEX IF NOT EXISTS idx_users_created_at 
ON users(created_at DESC);

-- 🔥 CRITICAL INDEX 4: Quiz Attempts Dashboard
-- Copy and paste this command, then click RUN
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_completed 
ON quiz_attempts(user_id, completed_at DESC) 
WHERE completed_at IS NOT NULL;

-- 🔥 CRITICAL INDEX 5: Course Progress Tracking
-- Copy and paste this command, then click RUN
CREATE INDEX IF NOT EXISTS idx_enrollments_user_progress 
ON enrollments(user_id, progress, last_accessed_at DESC);

-- 🔥 CRITICAL INDEX 6: Quiz Search & Filtering
-- Copy and paste this command, then click RUN
CREATE INDEX IF NOT EXISTS idx_quizzes_search_filters
ON quizzes(is_published, difficulty, category, created_at DESC)
WHERE is_published = true;

-- 🔥 CRITICAL INDEX 7: Enrollment Analytics (SIMPLIFIED)
-- Copy and paste this command, then click RUN
CREATE INDEX IF NOT EXISTS idx_enrollments_enrolled_at 
ON enrollments(enrolled_at DESC);

-- =====================================================
-- VERIFICATION: Check that all indexes were created
-- Run this after creating all indexes above
-- =====================================================

SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes 
WHERE indexname IN (
  'idx_quizzes_published_category_created',
  'idx_courses_published_category_created', 
  'idx_users_created_month',
  'idx_quiz_attempts_user_completed',
  'idx_enrollments_user_progress',
  'idx_quizzes_search_filters',
  'idx_enrollments_month'
)
AND schemaname = 'public'
ORDER BY tablename, indexname;