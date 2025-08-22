-- ==================================================================
-- ACADEX QUIZ ENHANCEMENT - COMPLETE QUESTION TYPES SUPPORT  
-- ==================================================================
-- 
-- This migration extends the quiz system to support all 7 question types
-- that are implemented in the QuizForm UI component.
--
-- CRITICAL: This migration MUST be run before any QuizForm UI improvements
-- to prevent save failures for advanced question types.
--
-- Supported Question Types:
-- ✅ multiple_choice - Traditional A/B/C/D questions  
-- ✅ single_choice - Radio button selection
-- ✅ true_false - Boolean questions
-- ✅ fill_blank - Text input answers
-- ✅ essay - Long-form text responses
-- ✅ matching - Pair matching exercises  
-- ✅ ordering - Sequence arrangement tasks
--
-- Author: Acadex Development Team
-- Date: August 21, 2025
-- Version: 2.0.0 (Critical Update)
-- ==================================================================

BEGIN;

-- =====================================================
-- STEP 1: Extend Question Type Support
-- =====================================================

-- Drop existing constraint if it exists
ALTER TABLE public.quiz_questions 
DROP CONSTRAINT IF EXISTS quiz_questions_question_type_check;

-- Update question_type column to support all 7 types
ALTER TABLE public.quiz_questions 
ALTER COLUMN question_type SET DEFAULT 'multiple_choice',
ADD CONSTRAINT quiz_questions_question_type_check 
CHECK (question_type IN (
  'multiple_choice',  -- Traditional A/B/C/D questions
  'single_choice',    -- Radio button selection  
  'true_false',       -- Boolean True/False questions
  'fill_blank',       -- Text input answers
  'essay',            -- Long-form text responses
  'matching',         -- Pair matching exercises
  'ordering'          -- Sequence arrangement tasks
));

-- =====================================================
-- STEP 2: Add Support for Complex Answer Types
-- =====================================================

-- Add JSON column for complex answer structures (matching, ordering)
ALTER TABLE public.quiz_questions 
ADD COLUMN IF NOT EXISTS correct_answer_json JSONB;

-- Add points column for weighted scoring
ALTER TABLE public.quiz_questions 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 1 CHECK (points > 0);

-- Add difficulty level for enhanced analytics
ALTER TABLE public.quiz_questions 
ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'medium'
CHECK (difficulty_level IN ('easy', 'medium', 'hard'));

-- Add media support columns (already exist in some schemas, adding IF NOT EXISTS)
ALTER TABLE public.quiz_questions 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- =====================================================
-- STEP 3: Update Existing Data
-- =====================================================

-- Ensure all existing questions have the default type
UPDATE public.quiz_questions 
SET question_type = 'multiple_choice' 
WHERE question_type IS NULL;

-- Set default points for existing questions
UPDATE public.quiz_questions 
SET points = 1 
WHERE points IS NULL;

-- Set default difficulty for existing questions  
UPDATE public.quiz_questions 
SET difficulty_level = 'medium'
WHERE difficulty_level IS NULL;

-- =====================================================
-- STEP 4: Performance Optimizations
-- =====================================================

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_quiz_questions_type 
ON public.quiz_questions(question_type);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty
ON public.quiz_questions(difficulty_level);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id_order 
ON public.quiz_questions(quiz_id, order_index);

-- =====================================================
-- STEP 5: Documentation and Comments
-- =====================================================

COMMENT ON COLUMN public.quiz_questions.question_type IS 
'Question type: multiple_choice, single_choice, true_false, fill_blank, essay, matching, ordering';

COMMENT ON COLUMN public.quiz_questions.correct_answer IS 
'Numeric answer index for choice-based questions (multiple_choice, single_choice, true_false). 0-based index for options array.';

COMMENT ON COLUMN public.quiz_questions.correct_answer_text IS 
'Text answer for fill_blank and essay questions. Used when question_type = ''fill_blank'' or ''essay''.';

COMMENT ON COLUMN public.quiz_questions.correct_answer_json IS 
'JSON answer for complex question types (matching, ordering). Stores arrays or objects representing correct answer structures.';

COMMENT ON COLUMN public.quiz_questions.points IS 
'Point value for this question. Used for weighted scoring calculations.';

COMMENT ON COLUMN public.quiz_questions.difficulty_level IS 
'Question difficulty: easy, medium, hard. Used for analytics and adaptive learning.';

-- =====================================================
-- STEP 6: Validation and Testing
-- =====================================================

-- Verify the migration succeeded
DO $$
DECLARE
    constraint_exists BOOLEAN;
    points_exists BOOLEAN;
    difficulty_exists BOOLEAN;
    json_answer_exists BOOLEAN;
BEGIN
    -- Verify constraint exists  
    SELECT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'quiz_questions' 
        AND c.conname = 'quiz_questions_question_type_check'
    ) INTO constraint_exists;

    IF NOT constraint_exists THEN
        RAISE EXCEPTION 'Migration failed: question_type constraint not created properly';
    END IF;

    -- Check if all required columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quiz_questions' AND column_name = 'points'
    ) INTO points_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quiz_questions' AND column_name = 'difficulty_level'
    ) INTO difficulty_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quiz_questions' AND column_name = 'correct_answer_json'
    ) INTO json_answer_exists;

    IF NOT points_exists THEN
        RAISE EXCEPTION 'Migration failed: points column not created';
    END IF;

    IF NOT difficulty_exists THEN
        RAISE EXCEPTION 'Migration failed: difficulty_level column not created';
    END IF;

    IF NOT json_answer_exists THEN
        RAISE EXCEPTION 'Migration failed: correct_answer_json column not created';
    END IF;

    RAISE NOTICE 'SUCCESS: Quiz questions table migration completed successfully!';
    RAISE NOTICE 'Supported question types: multiple_choice, single_choice, true_false, fill_blank, essay, matching, ordering';
    RAISE NOTICE 'New features: points, difficulty_level, correct_answer_json, media support';
END $$;

-- =====================================================
-- STEP 7: Sample Data for Testing (Optional)
-- =====================================================

-- Uncomment to insert sample questions for each type
/*
-- Sample multiple choice question
INSERT INTO public.quiz_questions (
    quiz_id, question, question_type, options, correct_answer, 
    explanation, order_index, points, difficulty_level
) VALUES (
    (SELECT id FROM public.quizzes LIMIT 1),
    'What is the capital of France?',
    'multiple_choice',
    '["Paris", "London", "Berlin", "Madrid"]',
    0,
    'Paris is the capital and largest city of France.',
    1, 1, 'easy'
);

-- Sample matching question
INSERT INTO public.quiz_questions (
    quiz_id, question, question_type, options, correct_answer_json,
    explanation, order_index, points, difficulty_level  
) VALUES (
    (SELECT id FROM public.quizzes LIMIT 1),
    'Match each country with its capital:',
    'matching', 
    '[{"left": "France", "right": "Paris"}, {"left": "Italy", "right": "Rome"}]',
    '[{"France": "Paris"}, {"Italy": "Rome"}]',
    'Match each country with its respective capital city.',
    2, 2, 'medium'
);
*/

COMMIT;

-- =====================================================
-- POST-MIGRATION VERIFICATION QUERIES
-- =====================================================

-- Verify schema is ready for all question types
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'quiz_questions' 
ORDER BY ordinal_position;

-- Check constraint details
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.quiz_questions'::regclass
AND contype = 'c';

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'MIGRATION COMPLETE - QuizForm UI Ready!';  
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update src/lib/supabase.ts QuizQuestion interface';  
    RAISE NOTICE '2. Run npm run build to verify TypeScript compatibility';
    RAISE NOTICE '3. Test all 7 question types in QuizForm';
    RAISE NOTICE '4. Proceed with UI improvements safely';
END $$;
