-- Fix Quiz Total Questions Count
-- This script updates all quizzes to have the correct total_questions count

-- Update all quizzes with correct question counts
UPDATE public.quizzes 
SET total_questions = (
    SELECT COUNT(*) 
    FROM public.quiz_questions 
    WHERE quiz_questions.quiz_id = quizzes.id
)
WHERE total_questions = 0 OR total_questions IS NULL;

-- Verify the update
SELECT 
    q.id,
    q.title,
    q.total_questions,
    (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as actual_count
FROM public.quizzes q
WHERE q.is_published = true
ORDER BY q.created_at DESC
LIMIT 10;

-- Show summary
SELECT 
    COUNT(*) as total_quizzes,
    COUNT(*) FILTER (WHERE total_questions > 0) as quizzes_with_questions,
    COUNT(*) FILTER (WHERE total_questions = 0) as quizzes_without_questions,
    AVG(total_questions) as avg_questions_per_quiz
FROM public.quizzes 
WHERE is_published = true;