-- =====================================================
-- OPTIMIZE QUIZ QUESTION TRIGGERS FOR BULK OPERATIONS
-- =====================================================
-- This script optimizes the trigger that updates quiz question counts
-- to handle bulk operations more efficiently

-- Option 1: Smart trigger that detects bulk operations and defers counting
-- =====================================================

-- First, add a session variable to indicate bulk operations
CREATE OR REPLACE FUNCTION set_bulk_operation(is_bulk boolean DEFAULT true)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.bulk_operation', is_bulk::text, false);
END;
$$ LANGUAGE plpgsql;

-- Modified trigger function that respects bulk operation mode
CREATE OR REPLACE FUNCTION update_quiz_question_count_optimized()
RETURNS TRIGGER AS $$
DECLARE
    is_bulk_op boolean;
BEGIN
    -- Check if we're in bulk operation mode
    is_bulk_op := COALESCE(current_setting('app.bulk_operation', true)::boolean, false);
    
    -- If bulk operation, skip individual updates (API will update at end)
    IF is_bulk_op THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Normal operation: update count immediately
    IF TG_OP = 'INSERT' THEN
        UPDATE public.quizzes 
        SET total_questions = (
            SELECT COUNT(*) FROM public.quiz_questions 
            WHERE quiz_id = NEW.quiz_id
        )
        WHERE id = NEW.quiz_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.quizzes 
        SET total_questions = (
            SELECT COUNT(*) FROM public.quiz_questions 
            WHERE quiz_id = OLD.quiz_id
        )
        WHERE id = OLD.quiz_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Replace the existing trigger with the optimized version
DROP TRIGGER IF EXISTS trigger_update_quiz_question_count ON public.quiz_questions;
CREATE TRIGGER trigger_update_quiz_question_count
    AFTER INSERT OR DELETE ON public.quiz_questions
    FOR EACH ROW EXECUTE FUNCTION update_quiz_question_count_optimized();

-- =====================================================
-- Option 2: Statement-level trigger (even better!)
-- =====================================================
-- This trigger fires once per statement, not once per row

CREATE OR REPLACE FUNCTION update_quiz_question_count_statement()
RETURNS TRIGGER AS $$
DECLARE
    affected_quiz_id uuid;
BEGIN
    -- Get all affected quiz IDs and update their counts in one go
    FOR affected_quiz_id IN 
        SELECT DISTINCT COALESCE(NEW.quiz_id, OLD.quiz_id) as quiz_id
        FROM (
            SELECT NEW.quiz_id, OLD.quiz_id
        ) AS affected_quizzes
    LOOP
        UPDATE public.quizzes 
        SET total_questions = (
            SELECT COUNT(*) FROM public.quiz_questions 
            WHERE quiz_id = affected_quiz_id
        )
        WHERE id = affected_quiz_id;
    END LOOP;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create statement-level trigger (fires once per SQL statement, not per row)
DROP TRIGGER IF EXISTS trigger_update_quiz_question_count_stmt ON public.quiz_questions;
CREATE TRIGGER trigger_update_quiz_question_count_stmt
    AFTER INSERT OR DELETE ON public.quiz_questions
    FOR EACH STATEMENT EXECUTE FUNCTION update_quiz_question_count_statement();

-- =====================================================
-- Option 3: Completely disable trigger and handle in API
-- =====================================================
-- For maximum performance, disable trigger entirely
-- and let API handle count updates

-- Disable the trigger
-- DROP TRIGGER IF EXISTS trigger_update_quiz_question_count ON public.quiz_questions;
-- DROP TRIGGER IF EXISTS trigger_update_quiz_question_count_stmt ON public.quiz_questions;

-- Create a manual refresh function for when needed
CREATE OR REPLACE FUNCTION refresh_quiz_question_counts()
RETURNS void AS $$
BEGIN
    UPDATE public.quizzes 
    SET total_questions = (
        SELECT COUNT(*) FROM public.quiz_questions 
        WHERE quiz_id = quizzes.id
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Test the bulk operation setting
SELECT set_bulk_operation(true);
SELECT current_setting('app.bulk_operation');

-- Check current triggers
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing, 
    action_orientation
FROM information_schema.triggers 
WHERE event_object_table = 'quiz_questions';

-- Test performance: Check how many quiz_questions exist
SELECT quiz_id, COUNT(*) as question_count
FROM public.quiz_questions
GROUP BY quiz_id
ORDER BY question_count DESC
LIMIT 10;

-- Verify quiz totals are accurate
SELECT 
    q.id,
    q.title,
    q.total_questions as stored_count,
    COUNT(qq.id) as actual_count,
    CASE 
        WHEN q.total_questions = COUNT(qq.id) THEN '✅ Correct'
        ELSE '❌ Mismatch'
    END as status
FROM public.quizzes q
LEFT JOIN public.quiz_questions qq ON q.id = qq.quiz_id
GROUP BY q.id, q.title, q.total_questions
HAVING q.total_questions != COUNT(qq.id) OR q.total_questions IS NULL
ORDER BY q.title;