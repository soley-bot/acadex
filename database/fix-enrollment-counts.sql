-- Fix enrollment count inconsistencies
-- This script will update the student_count field in courses table to match actual enrollments

-- First, let's check current state
SELECT 
    c.id,
    c.title,
    c.student_count as stored_count,
    COALESCE(e.actual_count, 0) as actual_count,
    CASE 
        WHEN c.student_count != COALESCE(e.actual_count, 0) THEN 'INCONSISTENT'
        ELSE 'OK'
    END as status
FROM courses c
LEFT JOIN (
    SELECT 
        course_id,
        COUNT(*) as actual_count
    FROM enrollments
    GROUP BY course_id
) e ON c.id = e.course_id
ORDER BY c.title;

-- Update all courses to have correct student counts
UPDATE courses 
SET student_count = COALESCE((
    SELECT COUNT(*) 
    FROM enrollments 
    WHERE enrollments.course_id = courses.id
), 0),
updated_at = NOW();

-- Verify the fix
SELECT 
    c.id,
    c.title,
    c.student_count as stored_count,
    COALESCE(e.actual_count, 0) as actual_count,
    CASE 
        WHEN c.student_count != COALESCE(e.actual_count, 0) THEN 'STILL INCONSISTENT'
        ELSE 'FIXED'
    END as status
FROM courses c
LEFT JOIN (
    SELECT 
        course_id,
        COUNT(*) as actual_count
    FROM enrollments
    GROUP BY course_id
) e ON c.id = e.course_id
ORDER BY c.title;

-- Ensure the trigger is working properly
-- Drop and recreate the trigger to make sure it's installed correctly
DROP TRIGGER IF EXISTS trigger_update_course_student_count ON public.enrollments;

CREATE OR REPLACE FUNCTION update_course_student_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.courses 
        SET student_count = student_count + 1,
            updated_at = NOW()
        WHERE id = NEW.course_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.courses 
        SET student_count = GREATEST(0, student_count - 1),
            updated_at = NOW()
        WHERE id = OLD.course_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_course_student_count
    AFTER INSERT OR DELETE ON public.enrollments
    FOR EACH ROW EXECUTE FUNCTION update_course_student_count();

-- Test the trigger by checking if it exists
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_course_student_count';
