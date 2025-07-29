-- DIAGNOSE LESSON PROGRESS TABLE ISSUES
-- This will help us understand what's causing the 400 error

-- =============================================
-- 1. CHECK EXACT TABLE STRUCTURE
-- =============================================

-- Get the exact column names and types
SELECT 
    'LESSON_PROGRESS TABLE COLUMNS:' as info,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'lesson_progress' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =============================================
-- 2. CHECK UNIQUE CONSTRAINTS
-- =============================================

-- Find the exact unique constraint name and columns
SELECT 
    'UNIQUE CONSTRAINTS:' as info,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    kcu.ordinal_position
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'lesson_progress'
    AND tc.table_schema = 'public'
    AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
ORDER BY tc.constraint_name, kcu.ordinal_position;

-- =============================================
-- 3. CHECK IF TABLE EXISTS AND HAS DATA
-- =============================================

-- Verify table exists
SELECT 
    'TABLE EXISTS CHECK:' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'lesson_progress' 
            AND table_schema = 'public'
        ) THEN '✅ lesson_progress table EXISTS'
        ELSE '❌ lesson_progress table MISSING'
    END as table_status;

-- Check if RLS is enabled
SELECT 
    'RLS STATUS:' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'lesson_progress' 
AND schemaname = 'public';

-- =============================================
-- 4. TEST BASIC INSERT (COMMENTED FOR SAFETY)
-- =============================================

/*
-- UNCOMMENT AND MODIFY TO TEST MANUAL INSERT
-- Replace with actual user_id and lesson_id values

INSERT INTO lesson_progress (user_id, lesson_id, is_completed)
VALUES (
    '12345678-1234-1234-1234-123456789012'::uuid,  -- Replace with real user_id
    '87654321-4321-4321-4321-210987654321'::uuid,  -- Replace with real lesson_id
    true
) 
ON CONFLICT (user_id, lesson_id) 
DO UPDATE SET 
    is_completed = EXCLUDED.is_completed,
    completed_at = CASE WHEN EXCLUDED.is_completed THEN NOW() ELSE NULL END
RETURNING *;
*/

-- =============================================
-- 5. CHECK CURRENT USER CONTEXT
-- =============================================

-- Check if auth context is working
SELECT 
    'AUTH CONTEXT:' as info,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN CONCAT('✅ User authenticated: ', auth.uid()::text)
        ELSE '❌ No authenticated user found'
    END as auth_status;

-- =============================================
-- 6. DIAGNOSTIC SUMMARY
-- =============================================

SELECT '🔍 LESSON PROGRESS 400 ERROR DIAGNOSIS' as message
UNION ALL
SELECT '1. Check table structure above - verify column names match'
UNION ALL
SELECT '2. Check unique constraints - might not be on (user_id, lesson_id)'
UNION ALL
SELECT '3. Verify table exists and RLS is properly configured'
UNION ALL
SELECT '4. Test manual INSERT with actual UUIDs'
UNION ALL
SELECT '5. Check if auth.uid() returns valid user ID';
