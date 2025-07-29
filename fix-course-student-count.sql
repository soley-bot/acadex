-- FIX COURSE STUDENT COUNT
-- This will update the student_count field to reflect actual enrollments

-- =============================================
-- 1. UPDATE CURRENT STUDENT COUNTS
-- =============================================

-- Update student_count for all courses based on actual enrollments
UPDATE public.courses 
SET student_count = (
    SELECT COUNT(DISTINCT e.user_id)
    FROM public.enrollments e 
    WHERE e.course_id = courses.id
);

-- =============================================
-- 2. VERIFY THE UPDATE
-- =============================================

-- Show updated student counts
SELECT 
    'UPDATED COURSE STUDENT COUNTS:' as info,
    c.title,
    c.student_count as displayed_count,
    COUNT(DISTINCT e.user_id) as actual_enrollments,
    CASE 
        WHEN c.student_count = COUNT(DISTINCT e.user_id) THEN '✅ CORRECT'
        ELSE '❌ MISMATCH'
    END as status
FROM public.courses c
LEFT JOIN public.enrollments e ON e.course_id = c.id
GROUP BY c.id, c.title, c.student_count
ORDER BY c.title;

-- =============================================
-- 3. CREATE TRIGGER TO KEEP COUNTS UPDATED
-- =============================================

-- Function to update course student count when enrollments change
CREATE OR REPLACE FUNCTION update_course_student_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update student count for the affected course
    IF TG_OP = 'INSERT' THEN
        -- When new enrollment is added
        UPDATE public.courses 
        SET student_count = (
            SELECT COUNT(DISTINCT user_id) 
            FROM public.enrollments 
            WHERE course_id = NEW.course_id
        )
        WHERE id = NEW.course_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- When enrollment is removed
        UPDATE public.courses 
        SET student_count = (
            SELECT COUNT(DISTINCT user_id) 
            FROM public.enrollments 
            WHERE course_id = OLD.course_id
        )
        WHERE id = OLD.course_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_course_student_count ON public.enrollments;

-- Create trigger on enrollments table
CREATE TRIGGER trigger_update_course_student_count
    AFTER INSERT OR DELETE ON public.enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_course_student_count();

-- =============================================
-- 4. TEST THE TRIGGER (SAFE READ-ONLY)
-- =============================================

-- Show current enrollment statistics
SELECT 
    'ENROLLMENT STATISTICS:' as info,
    COUNT(*) as total_enrollments,
    COUNT(DISTINCT user_id) as unique_students,
    COUNT(DISTINCT course_id) as courses_with_enrollments
FROM public.enrollments;

-- Show courses with their enrollment counts
SELECT 
    'COURSES WITH STUDENT COUNTS:' as info,
    c.title,
    c.student_count,
    c.instructor_name
FROM public.courses c
WHERE c.is_published = true
ORDER BY c.student_count DESC;

-- =============================================
-- 5. SUCCESS MESSAGE
-- =============================================

SELECT '🎯 COURSE STUDENT COUNT FIXED!' as message
UNION ALL
SELECT '✅ Updated all course student_count fields'
UNION ALL
SELECT '🔄 Created trigger to maintain accurate counts'
UNION ALL
SELECT '📊 Student counts now reflect actual enrollments'
UNION ALL
SELECT '🚀 Course listings will show correct student numbers';
