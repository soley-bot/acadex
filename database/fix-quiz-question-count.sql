-- =====================================================
-- FIX QUIZ QUESTION COUNT MISMATCH
-- =====================================================
-- This script fixes the quiz question count discrepancy
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. UPDATE total_questions field to match actual question count
-- =====================================================

UPDATE public.quizzes 
SET total_questions = (
    SELECT COUNT(*) 
    FROM public.quiz_questions 
    WHERE quiz_questions.quiz_id = quizzes.id
);

-- 2. Create function to automatically update total_questions when questions change
-- =====================================================

CREATE OR REPLACE FUNCTION update_quiz_question_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.quizzes 
        SET total_questions = total_questions + 1,
            updated_at = NOW()
        WHERE id = NEW.quiz_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.quizzes 
        SET total_questions = GREATEST(0, total_questions - 1),
            updated_at = NOW()
        WHERE id = OLD.quiz_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Create triggers to maintain question count automatically
-- =====================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_quiz_question_count_insert ON public.quiz_questions;
DROP TRIGGER IF EXISTS trigger_update_quiz_question_count_delete ON public.quiz_questions;

-- Create new triggers
CREATE TRIGGER trigger_update_quiz_question_count_insert
    AFTER INSERT ON public.quiz_questions
    FOR EACH ROW EXECUTE FUNCTION update_quiz_question_count();

CREATE TRIGGER trigger_update_quiz_question_count_delete
    AFTER DELETE ON public.quiz_questions
    FOR EACH ROW EXECUTE FUNCTION update_quiz_question_count();

-- 4. Verify the fix worked
-- =====================================================

-- Show current quiz question counts (uncomment to see results)
-- SELECT 
--     q.id,
--     q.title,
--     q.total_questions as stored_count,
--     COUNT(qq.id) as actual_count,
--     CASE 
--         WHEN q.total_questions = COUNT(qq.id) THEN '✅ CORRECT'
--         ELSE '❌ MISMATCH'
--     END as status
-- FROM public.quizzes q
-- LEFT JOIN public.quiz_questions qq ON q.id = qq.quiz_id
-- GROUP BY q.id, q.title, q.total_questions
-- ORDER BY q.created_at DESC;

COMMIT;

-- Success message
SELECT 'Quiz question count fix completed successfully!' as result;
