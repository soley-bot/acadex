-- Debug query to check questions for the specific quiz
-- Quiz ID from your log: 6932064c-31e1-400a-8e4e-1a84cc634133

SELECT 
  q.id as quiz_id,
  q.title as quiz_title,
  q.total_questions as quiz_total_questions,
  COUNT(qq.id) as actual_question_count,
  array_agg(qq.question ORDER BY qq.order_index) as question_texts
FROM quizzes q
LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
WHERE q.id = '6932064c-31e1-400a-8e4e-1a84cc634133'
GROUP BY q.id, q.title, q.total_questions;

-- Also check all quizzes and their question counts
SELECT 
  q.id,
  q.title,
  q.total_questions,
  COUNT(qq.id) as actual_questions,
  q.is_published
FROM quizzes q
LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
GROUP BY q.id, q.title, q.total_questions, q.is_published
ORDER BY q.created_at DESC
LIMIT 10;

-- Check if quiz_questions table has any data at all
SELECT COUNT(*) as total_questions_in_db FROM quiz_questions;