-- =====================================================
-- 🔍 DATABASE PERFORMANCE VERIFICATION QUERIES  
-- Run schema-check.sql first if you get column errors
-- =====================================================

-- Check that all 7 critical indexes were created successfully
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname IN (
    'idx_quizzes_course_active',
    'idx_quiz_questions_quiz_order', 
    'idx_users_created_at',
    'idx_courses_category_active',
    'idx_user_progress_user_course',
    'idx_quiz_attempts_user_quiz',
    'idx_enrollments_enrolled_at'
)
ORDER BY indexname;

-- =====================================================
-- 📊 PERFORMANCE MEASUREMENT QUERIES
-- Compare query execution times
-- =====================================================

-- Test 1: Quiz Management Query (Should be FAST with idx_quizzes_course_active)
-- Simplified to avoid column name issues
EXPLAIN ANALYZE 
SELECT id, title, created_at 
FROM quizzes 
WHERE course_id = (SELECT id FROM courses LIMIT 1) 
ORDER BY created_at DESC
LIMIT 10;

-- Test 2: Analytics User Count (Should be FAST with idx_users_created_at)  
EXPLAIN ANALYZE
SELECT COUNT(*) as total_users,
       COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_users
FROM users;

-- Test 3: Course Listings (Should be FAST with idx_courses_category_active)
-- Simplified to avoid column name issues
EXPLAIN ANALYZE
SELECT id, title, created_at
FROM courses 
ORDER BY created_at DESC
LIMIT 10;

-- Test 4: User Progress Dashboard (Should be FAST with idx_user_progress_user_course)
EXPLAIN ANALYZE
SELECT up.*, c.title as course_title 
FROM user_progress up
JOIN courses c ON c.id = up.course_id
WHERE up.user_id = (SELECT id FROM users LIMIT 1)
ORDER BY up.updated_at DESC;

-- =====================================================
-- 📈 SUCCESS METRICS TO LOOK FOR:
-- =====================================================
-- ✅ All 7 indexes should be listed in first query
-- ✅ EXPLAIN ANALYZE should show "Index Scan" not "Seq Scan" 
-- ✅ Execution times should be under 50ms for most queries
-- ✅ "Buffers: shared hit=" should be high, "read=" should be low
-- =====================================================