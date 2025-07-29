-- DEBUG LESSON PROGRESS 400 ERROR
-- Check table structure and find the issue

-- =============================================
-- 1. CHECK LESSON PROGRESS TABLE STRUCTURE
-- =============================================

-- Check exact columns in lesson_progress table
SELECT 
    'LESSON PROGRESS TABLE STRUCTURE:' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'lesson_progress' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =============================================
-- 2. CHECK CONSTRAINTS AND TRIGGERS
-- =============================================

-- Check for any constraints that might cause 400
SELECT 
    'LESSON PROGRESS CONSTRAINTS:' as info,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'lesson_progress' 
AND table_schema = 'public';

-- Check for triggers that might interfere
SELECT 
    'LESSON PROGRESS TRIGGERS:' as info,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'lesson_progress' 
AND event_object_schema = 'public';

-- =============================================
-- 3. TEST INSERT WITH MINIMAL DATA
-- =============================================

-- Test what the frontend is trying to do (replace with actual values)
/*
-- BEFORE RUNNING: Replace these with real values
-- user_id: get from auth.uid()
-- lesson_id: get from your course lessons

-- Test 1: Minimal upsert (what should work)
INSERT INTO lesson_progress (user_id, lesson_id, is_completed)
VALUES (
    'your-user-id-here',  -- Replace with actual user ID
    'your-lesson-id-here', -- Replace with actual lesson ID  
    true
) ON CONFLICT (user_id, lesson_id) 
DO UPDATE SET 
    is_completed = EXCLUDED.is_completed,
    completed_at = CASE WHEN EXCLUDED.is_completed THEN NOW() ELSE NULL END
RETURNING *;

-- Test 2: With updated_at (might cause 400 if column doesn't exist)
INSERT INTO lesson_progress (user_id, lesson_id, is_completed, updated_at)
VALUES (
    'your-user-id-here',  -- Replace with actual user ID
    'your-lesson-id-here', -- Replace with actual lesson ID  
    true,
    NOW()
) ON CONFLICT (user_id, lesson_id) 
DO UPDATE SET 
    is_completed = EXCLUDED.is_completed,
    completed_at = CASE WHEN EXCLUDED.is_completed THEN NOW() ELSE NULL END,
    updated_at = EXCLUDED.updated_at
RETURNING *;
*/

-- =============================================
-- 4. CHECK SAMPLE DATA  
-- =============================================

-- Check if there's any existing lesson progress data
SELECT 
    'SAMPLE LESSON PROGRESS DATA:' as info,
    id, user_id, lesson_id, is_completed, completed_at,
    created_at,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lesson_progress' AND column_name = 'updated_at') 
         THEN 'updated_at column exists' 
         ELSE 'updated_at column MISSING' 
    END as updated_at_status
FROM lesson_progress 
LIMIT 3;

-- =============================================
-- 5. DIAGNOSTIC SUMMARY
-- =============================================

SELECT '🔍 DEBUGGING LESSON PROGRESS 400 ERROR' as message
UNION ALL
SELECT '1. Check column structure above'
UNION ALL  
SELECT '2. Look for missing/extra columns in the upsert'
UNION ALL
SELECT '3. Check if updated_at column exists'
UNION ALL
SELECT '4. Verify user_id and lesson_id are valid UUIDs';
