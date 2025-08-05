-- ==================================================================
-- ACADEX QUIZ ENHANCEMENT - QUESTION TYPES SUPPORT
-- ==================================================================
-- 
-- This migration adds support for multiple question types in the quiz system
-- Run this script in your Supabase SQL Editor to enable:
-- - Multiple Choice questions (existing)
-- - True/False questions (new)
-- - Fill-in-the-Blank questions (new)
--
-- Author: Acadex Development Team
-- Date: August 4, 2025
-- Version: 1.0.0
-- ==================================================================

BEGIN;

-- Add question_type column with proper constraints
ALTER TABLE public.quiz_questions 
ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'multiple_choice' 
CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank'));

-- Update existing questions to have the default type
UPDATE public.quiz_questions 
SET question_type = 'multiple_choice' 
WHERE question_type IS NULL;

-- Add support for text-based answers (fill-in-the-blank)
ALTER TABLE public.quiz_questions 
ADD COLUMN IF NOT EXISTS correct_answer_text TEXT;

-- Add performance index for question type filtering
CREATE INDEX IF NOT EXISTS idx_quiz_questions_type 
ON public.quiz_questions(question_type);

-- Add comprehensive indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id_order 
ON public.quiz_questions(quiz_id, order_index);

-- Add documentation comments
COMMENT ON COLUMN public.quiz_questions.question_type IS 
'Question type: multiple_choice (A/B/C/D), true_false (True/False), fill_blank (text input)';

COMMENT ON COLUMN public.quiz_questions.correct_answer_text IS 
'Text answer for fill-in-the-blank questions. Used when question_type = ''fill_blank''';

COMMENT ON COLUMN public.quiz_questions.correct_answer IS 
'Numeric answer index for multiple_choice and true_false questions. 0-based index for options array';

-- Verify the migration
DO $$
BEGIN
    -- Check if columns exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quiz_questions' 
        AND column_name = 'question_type'
    ) THEN
        RAISE EXCEPTION 'Migration failed: question_type column not created';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quiz_questions' 
        AND column_name = 'correct_answer_text'
    ) THEN
        RAISE EXCEPTION 'Migration failed: correct_answer_text column not created';
    END IF;
    
    RAISE NOTICE 'Quiz question types migration completed successfully!';
    RAISE NOTICE 'Supported question types: multiple_choice, true_false, fill_blank';
    RAISE NOTICE 'Ready for AI-enhanced quiz generation.';
END $$;

COMMIT;

-- ==================================================================
-- MIGRATION COMPLETE
-- ==================================================================
