-- Fix Quiz Duration Defaults & UI Improvements
-- This SQL ensures the database schema matches the frontend expectations
-- Frontend improvements: Better labels, icons, and validation warnings

-- 1. Check current state of quizzes table
SELECT 
    id, 
    title, 
    duration_minutes, 
    time_limit_minutes,
    CASE 
        WHEN time_limit_minutes IS NULL THEN 'No time limit ✅'
        WHEN time_limit_minutes < duration_minutes THEN 'Warning: Time limit shorter than expected duration! ⚠️'
        WHEN time_limit_minutes >= duration_minutes THEN 'Good: Time limit appropriate ✅'
        ELSE 'Unknown'
    END as time_setting_status
FROM quizzes 
ORDER BY created_at DESC;

-- 2. Update the default value for duration_minutes to match database schema (10)
-- (This should already be correct based on your schema, but including for completeness)
ALTER TABLE quizzes 
ALTER COLUMN duration_minutes SET DEFAULT 10;

-- 3. Verify the column definition
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'quizzes' 
    AND column_name IN ('duration_minutes', 'time_limit_minutes');

-- 4. Optional: Update any NULL values to the default (shouldn't be any with NOT NULL constraint)
UPDATE quizzes 
SET duration_minutes = 10 
WHERE duration_minutes IS NULL;

-- 5. Fix any problematic time settings where time limit is shorter than expected duration
-- Uncomment and modify the quiz IDs as needed:
-- UPDATE quizzes 
-- SET time_limit_minutes = duration_minutes + 10  -- Add 10 min buffer
-- WHERE time_limit_minutes < duration_minutes;

-- 6. Final verification - check all quiz durations with improved display
SELECT 
    id,
    title,
    duration_minutes as expected_duration,
    time_limit_minutes as max_time_allowed,
    CASE 
        WHEN time_limit_minutes IS NULL THEN '∞ Unlimited'
        ELSE time_limit_minutes::text || ' min limit'
    END as time_policy,
    created_at
FROM quizzes 
ORDER BY created_at DESC;
