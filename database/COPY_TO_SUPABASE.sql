-- ===============================================
-- BASIC PERFORMANCE INDEXES (SAFE TO RUN)
-- Copy this entire content and run in Supabase SQL Editor
-- ===============================================

-- 🚀 Course-related indexes for faster filtering
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published) 
WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_courses_category_published ON courses(category) 
WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_courses_level_published ON courses(level) 
WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_courses_created_published ON courses(created_at DESC) 
WHERE is_published = true;

-- Composite index for course filtering (MOST IMPORTANT)
CREATE INDEX IF NOT EXISTS idx_courses_filter ON courses(is_published, category, level, created_at DESC);

-- 🧩 Quiz-related indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_published ON quizzes(is_published) 
WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty_published ON quizzes(difficulty) 
WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_quizzes_category_published ON quizzes(category) 
WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_quizzes_created_published ON quizzes(created_at DESC) 
WHERE is_published = true;

-- Composite index for quiz filtering (MOST IMPORTANT)
CREATE INDEX IF NOT EXISTS idx_quizzes_filter ON quizzes(is_published, category, difficulty, created_at DESC);

-- 📝 Quiz structure indexes
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_order ON quiz_questions(quiz_id, order_index);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz_time ON quiz_attempts(user_id, quiz_id, completed_at DESC);

-- 👥 User engagement indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_user_time ON enrollments(user_id, enrolled_at DESC);

CREATE INDEX IF NOT EXISTS idx_enrollments_course_time ON enrollments(course_id, enrolled_at DESC);

CREATE INDEX IF NOT EXISTS idx_enrollments_progress_filter ON enrollments(user_id, progress DESC) 
WHERE progress > 0;

-- 🔍 Full-text search indexes (POWERFUL for search)
CREATE INDEX IF NOT EXISTS idx_courses_search ON courses 
USING gin(to_tsvector('english', title || ' ' || description || ' ' || category))
WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_quizzes_search ON quizzes 
USING gin(to_tsvector('english', title || ' ' || description || ' ' || category))
WHERE is_published = true;

-- 📊 Analytics indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- ===============================================
-- ANALYZE TABLES FOR BETTER QUERY PLANNING
-- ===============================================

ANALYZE courses;
ANALYZE quizzes;
ANALYZE quiz_questions;
ANALYZE enrollments;
ANALYZE quiz_attempts;
ANALYZE users;
