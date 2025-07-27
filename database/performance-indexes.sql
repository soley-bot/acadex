-- ===============================================
-- HIGH-PERFORMANCE DATABASE INDEXES (CORRECTED)
-- Run these in your Supabase SQL Editor
-- ===============================================

-- 🚀 Course-related indexes for faster filtering
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published) 
WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category) 
WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level) 
WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC) 
WHERE is_published = true;

-- Composite index for course filtering
CREATE INDEX IF NOT EXISTS idx_courses_filter ON courses(is_published, category, level, created_at DESC);

-- 🧩 Quiz-related indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_published ON quizzes(is_published) 
WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty ON quizzes(difficulty) 
WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_quizzes_category ON quizzes(category) 
WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_quizzes_created_at ON quizzes(created_at DESC) 
WHERE is_published = true;

-- 📚 Course structure indexes (for lesson navigation)
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id, order_index);

CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON course_lessons(module_id, order_index);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON lesson_progress(user_id, lesson_id);

-- 📝 Quiz structure indexes
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id, order_index);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id, completed_at DESC);

-- 👥 User engagement indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id, enrolled_at DESC);

CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id, enrolled_at DESC);

CREATE INDEX IF NOT EXISTS idx_enrollments_progress ON enrollments(user_id, progress DESC) 
WHERE progress > 0;

-- 🔍 Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_courses_search ON courses 
USING gin(to_tsvector('english', title || ' ' || description || ' ' || category));

CREATE INDEX IF NOT EXISTS idx_quizzes_search ON quizzes 
USING gin(to_tsvector('english', title || ' ' || description || ' ' || category));

-- 📊 Analytics indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- ===============================================
-- OPTIMIZE EXISTING TABLES
-- ===============================================

-- Analyze tables to update statistics
ANALYZE courses;
ANALYZE quizzes;
ANALYZE course_modules;
ANALYZE course_lessons;
ANALYZE quiz_questions;
ANALYZE enrollments;
ANALYZE quiz_attempts;
ANALYZE users;

-- ===============================================
-- PERFORMANCE MONITORING VIEWS
-- ===============================================

-- View for monitoring slow queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    min_time,
    max_time
FROM pg_stat_statements 
WHERE mean_time > 100 -- queries taking more than 100ms on average
ORDER BY mean_time DESC;

-- View for monitoring index usage
CREATE OR REPLACE VIEW index_usage AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_all_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- ===============================================
-- VACUUM AND MAINTENANCE
-- ===============================================

-- Schedule regular maintenance (run weekly)
-- VACUUM ANALYZE courses;
-- VACUUM ANALYZE quizzes;
-- VACUUM ANALYZE enrollments;
-- VACUUM ANALYZE quiz_attempts;

-- ===============================================
-- QUERY EXAMPLES WITH INDEXES
-- ===============================================

/*
-- Fast course listing (uses idx_courses_filter)
SELECT id, title, description, thumbnail_url, level, category, duration
FROM courses 
WHERE is_published = true 
  AND category = 'English Grammar'
  AND level = 'Intermediate'
ORDER BY created_at DESC 
LIMIT 20;

-- Fast user enrollments (uses idx_enrollments_user_id)
SELECT e.id, e.enrolled_at, e.progress, c.title, c.thumbnail_url
FROM enrollments e
JOIN courses c ON c.id = e.course_id
WHERE e.user_id = $1
ORDER BY e.enrolled_at DESC
LIMIT 10;

-- Fast quiz attempts (uses idx_quiz_attempts_user_quiz)
SELECT qa.id, qa.score, qa.completed_at, q.title, q.difficulty
FROM quiz_attempts qa
JOIN quizzes q ON q.id = qa.quiz_id
WHERE qa.user_id = $1
ORDER BY qa.completed_at DESC
LIMIT 5;
*/
