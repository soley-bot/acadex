-- =====================================================
-- 🔍 SCHEMA VERIFICATION - Run this first to check column names
-- =====================================================

-- Check quizzes table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quizzes' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check courses table columns  
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'courses' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check users table columns
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check user_progress table columns
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'user_progress' AND table_schema = 'public'
ORDER BY ordinal_position;