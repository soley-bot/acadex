-- Quiz Data Integrity Fix & Validation Script
-- This script identifies and helps fix quiz questions with missing or invalid correct answers

-- 1. Identify questions with missing correct answers
SELECT 
    q.id,
    q.question,
    q.question_type,
    q.correct_answer,
    q.correct_answer_text,
    q.correct_answer_json,
    CASE 
        WHEN q.question_type IN ('multiple_choice', 'single_choice', 'true_false') 
             AND q.correct_answer IS NULL THEN 'Missing correct_answer index'
        WHEN q.question_type IN ('fill_blank', 'essay') 
             AND (q.correct_answer_text IS NULL OR q.correct_answer_text = '') THEN 'Missing correct_answer_text'
        WHEN q.question_type IN ('matching', 'ordering') 
             AND (q.correct_answer_json IS NULL OR q.correct_answer_json = '[]'::jsonb) THEN 'Missing correct_answer_json'
        ELSE 'OK'
    END as validation_status
FROM quiz_questions q
WHERE 
    -- Find questions missing required correct answers
    (q.question_type IN ('multiple_choice', 'single_choice', 'true_false') AND q.correct_answer IS NULL)
    OR (q.question_type IN ('fill_blank', 'essay') AND (q.correct_answer_text IS NULL OR q.correct_answer_text = ''))
    OR (q.question_type IN ('matching', 'ordering') AND (q.correct_answer_json IS NULL OR q.correct_answer_json = '[]'::jsonb))
ORDER BY q.order_index;

-- 2. Show quiz attempts that might be affected by bad data
SELECT 
    qa.id as attempt_id,
    q.title as quiz_title,
    qq.question,
    qq.question_type,
    qa.score,
    qa.completed_at
FROM quiz_attempts qa
JOIN quizzes q ON qa.quiz_id = q.id
JOIN quiz_questions qq ON qq.quiz_id = q.id
WHERE qq.id IN (
    SELECT id FROM quiz_questions 
    WHERE 
        (question_type IN ('multiple_choice', 'single_choice', 'true_false') AND correct_answer IS NULL)
        OR (question_type IN ('fill_blank', 'essay') AND (correct_answer_text IS NULL OR correct_answer_text = ''))
        OR (question_type IN ('matching', 'ordering') AND (correct_answer_json IS NULL OR correct_answer_json = '[]'::jsonb))
)
ORDER BY qa.completed_at DESC;

-- 3. Fix specific known issues (run after manual verification)
-- Example: Fix the known matching question
-- UPDATE quiz_questions 
-- SET correct_answer_json = '{"0": 0, "1": 1}'::jsonb
-- WHERE question_type = 'matching' 
--   AND correct_answer_json = '[]'::jsonb
--   AND question LIKE '%match the word%';

-- 4. Add constraints to prevent future bad data (uncomment to enable)
-- ALTER TABLE quiz_questions 
-- ADD CONSTRAINT check_correct_answer_multiple_choice 
-- CHECK (
--     (question_type NOT IN ('multiple_choice', 'single_choice', 'true_false')) 
--     OR (correct_answer IS NOT NULL)
-- );

-- ALTER TABLE quiz_questions 
-- ADD CONSTRAINT check_correct_answer_text 
-- CHECK (
--     (question_type NOT IN ('fill_blank', 'essay')) 
--     OR (correct_answer_text IS NOT NULL AND correct_answer_text != '')
-- );

-- ALTER TABLE quiz_questions 
-- ADD CONSTRAINT check_correct_answer_json 
-- CHECK (
--     (question_type NOT IN ('matching', 'ordering')) 
--     OR (correct_answer_json IS NOT NULL AND correct_answer_json != '[]'::jsonb)
-- );
