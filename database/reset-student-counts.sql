-- Reset all student counts to 0 since there are no enrollments
-- This fixes the inconsistency where courses show student counts but no enrollments exist

-- First, verify current state
SELECT 
    title,
    student_count,
    created_at
FROM courses 
WHERE student_count > 0
ORDER BY student_count DESC;

-- Reset all student counts to 0
UPDATE courses 
SET student_count = 0,
    updated_at = NOW()
WHERE student_count > 0;

-- Verify the fix
SELECT 
    title,
    student_count,
    updated_at
FROM courses 
ORDER BY title;
