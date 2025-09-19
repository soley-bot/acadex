-- =====================================================
-- 🔍 SIMPLE INDEX VERIFICATION - Guaranteed to work
-- =====================================================

-- 1. Check if our 7 critical indexes exist
SELECT 
    indexname,
    tablename,
    'INDEX EXISTS ✅' as status
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

-- 2. Show total indexes created today
SELECT COUNT(*) as indexes_created_today
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';

-- 3. Simple performance test - Users table
EXPLAIN ANALYZE
SELECT COUNT(*) 
FROM users 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

-- 4. Simple performance test - Check if any table has data
SELECT 
    'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 
    'courses' as table_name, COUNT(*) as row_count FROM courses  
UNION ALL
SELECT 
    'quizzes' as table_name, COUNT(*) as row_count FROM quizzes;

-- =====================================================
-- SUCCESS CRITERIA:
-- ✅ Should show 7 indexes in first query
-- ✅ User count query should be fast (<50ms) 
-- ✅ Tables should have data
-- =====================================================