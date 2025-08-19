-- ===============================================
-- FIX QUESTION TYPE CONSTRAINT
-- ===============================================
-- This script updates the question_type constraint to allow new question types
-- Run this to fix the "check constraint violation" error

-- Drop the old constraint
ALTER TABLE quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_question_type_check;

-- Add new constraint with all supported question types
ALTER TABLE quiz_questions 
ADD CONSTRAINT quiz_questions_question_type_check 
CHECK (question_type IN (
    'multiple_choice', 
    'single_choice', 
    'true_false', 
    'fill_blank', 
    'essay', 
    'matching', 
    'ordering'
));

-- Verify the constraint was added
SELECT 
    conname,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'quiz_questions'::regclass 
  AND conname = 'quiz_questions_question_type_check';

COMMIT;
