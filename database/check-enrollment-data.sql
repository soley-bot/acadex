-- Quick database diagnostic for enrollment counts
-- Check if there are enrollments and what counts are showing

-- 1. Check total enrollments in database
SELECT COUNT(*) as total_enrollments FROM enrollments;

-- 2. Check courses and their enrollment counts
SELECT 
    c.id,
    c.title,
    c.student_count as stored_count,
    COALESCE(enrollment_counts.actual_count, 0) as actual_count,
    CASE 
        WHEN c.student_count != COALESCE(enrollment_counts.actual_count, 0) 
        THEN 'MISMATCH' 
        ELSE 'OK' 
    END as status
FROM courses c
LEFT JOIN (
    SELECT 
        course_id,
        COUNT(*) as actual_count
    FROM enrollments
    GROUP BY course_id
) enrollment_counts ON c.id = enrollment_counts.course_id
ORDER BY c.student_count DESC, c.title;

-- 3. Check if enrollments table has data
SELECT 
    course_id,
    COUNT(*) as enrollment_count,
    MIN(created_at) as first_enrollment,
    MAX(created_at) as last_enrollment
FROM enrollments 
GROUP BY course_id
ORDER BY enrollment_count DESC;

-- 4. Sample of actual enrollment records
SELECT 
    e.id,
    e.course_id,
    c.title as course_title,
    e.user_id,
    u.name as user_name,
    e.created_at
FROM enrollments e
JOIN courses c ON e.course_id = c.id
LEFT JOIN users u ON e.user_id = u.id
ORDER BY e.created_at DESC
LIMIT 10;
