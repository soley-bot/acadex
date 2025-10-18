-- =====================================================
-- SAFE QUIZ BUILDER OPTIMIZATION - STEP BY STEP
-- Run these commands ONE AT A TIME in Supabase SQL Editor
-- =====================================================

-- Step 1: Create the quiz questions ordering index
-- This optimizes question loading and reordering operations
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_order 
ON quiz_questions(quiz_id, order_index ASC);

-- Step 2: Create the draft quiz management index  
-- This optimizes admin quiz builder draft filtering
CREATE INDEX IF NOT EXISTS idx_quizzes_admin_drafts
ON quizzes(is_published, updated_at DESC)
WHERE is_published = false;

-- Step 3: Verify the indexes were created successfully
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE indexname IN (
    'idx_quiz_questions_quiz_order',
    'idx_quizzes_admin_drafts'
)
ORDER BY tablename, indexname;

-- Step 4: Check your current quiz data stats
SELECT 
    'Total quizzes' as metric,
    COUNT(*)::text as value
FROM quizzes
UNION ALL
SELECT 
    'Draft quizzes',
    COUNT(*)::text
FROM quizzes 
WHERE is_published = false
UNION ALL
SELECT 
    'Total questions',
    COUNT(*)::text
FROM quiz_questions
UNION ALL
SELECT 
    'Avg questions per quiz',
    ROUND(AVG(question_count), 1)::text
FROM (
    SELECT COUNT(*) as question_count 
    FROM quiz_questions 
    GROUP BY quiz_id
) subq;

-- Step 5: Test basic query performance (safe)
-- This just shows the query plan without executing on large data
EXPLAIN 
SELECT id, title, updated_at 
FROM quizzes 
WHERE is_published = false 
ORDER BY updated_at DESC 
LIMIT 10;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Quiz Builder Optimization Complete! 🚀' as status;