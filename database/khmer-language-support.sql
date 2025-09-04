-- =====================================================
-- KHMER LANGUAGE SUPPORT SQL UPDATES FOR SUPABASE
-- =====================================================

-- Run these SQL commands in your Supabase SQL Editor to ensure
-- proper support for Khmer language content in quiz generation

-- =====================================================
-- 1. DATABASE ENCODING & COLLATION
-- =====================================================

-- Check current database encoding (should already be UTF8 in Supabase)
-- This is just for verification - Supabase uses UTF8 by default
SELECT pg_encoding_to_char(encoding) as database_encoding 
FROM pg_database 
WHERE datname = current_database();

-- =====================================================
-- 2. UPDATE TEXT FIELD LENGTHS FOR KHMER CONTENT
-- =====================================================

-- Khmer text takes more bytes than Latin text due to Unicode complexity
-- Update quiz titles to handle longer Khmer titles
-- Note: PostgreSQL 'text' type already supports unlimited length, but let's ensure consistency

-- Update quiz questions table for better Khmer support
ALTER TABLE public.quiz_questions 
ALTER COLUMN question TYPE text,
ALTER COLUMN explanation TYPE text;

-- Ensure correct_answer_text can handle long Khmer explanations
ALTER TABLE public.quiz_questions 
ALTER COLUMN correct_answer_text TYPE text;

-- Update quizzes table for Khmer content
ALTER TABLE public.quizzes
ALTER COLUMN title TYPE text,
ALTER COLUMN description TYPE text,
ALTER COLUMN instructions TYPE text;

-- Update course tables for Khmer support
ALTER TABLE public.courses
ALTER COLUMN title TYPE text,
ALTER COLUMN description TYPE text;

ALTER TABLE public.course_modules
ALTER COLUMN title TYPE text,
ALTER COLUMN description TYPE text;

ALTER TABLE public.course_lessons
ALTER COLUMN title TYPE text,
ALTER COLUMN content TYPE text;

-- =====================================================
-- 3. CREATE KHMER TEXT VALIDATION FUNCTION
-- =====================================================

-- Function to validate Khmer Unicode characters
CREATE OR REPLACE FUNCTION validate_khmer_text(input_text text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if text contains valid Khmer Unicode range (U+1780-U+17FF)
    -- This is a basic validation - more complex validation handled in application layer
    
    IF input_text IS NULL OR input_text = '' THEN
        RETURN true; -- Allow empty text
    END IF;
    
    -- Basic length check (Khmer text can be longer due to Unicode complexity)
    IF char_length(input_text) > 10000 THEN
        RETURN false;
    END IF;
    
    -- Check for basic printable characters (including Khmer range)
    -- This allows Khmer (U+1780-U+17FF), Latin, numbers, and common punctuation
    IF input_text ~ '^[\x{0020}-\x{007E}\x{1780}-\x{17FF}\x{0080}-\x{024F}\x{2000}-\x{206F}]*$' THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$;

-- =====================================================
-- 4. CREATE KHMER-SAFE JSON VALIDATION FUNCTION
-- =====================================================

-- Function to validate JSON that might contain Khmer text
CREATE OR REPLACE FUNCTION validate_khmer_json(json_text text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    -- First check if it's valid JSON
    BEGIN
        PERFORM json_text::json;
    EXCEPTION WHEN OTHERS THEN
        RETURN false;
    END;
    
    -- Check if the JSON content is reasonable for Khmer
    IF char_length(json_text) > 100000 THEN -- 100KB limit
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$;

-- =====================================================
-- 5. ADD CONSTRAINTS FOR KHMER CONTENT VALIDATION
-- =====================================================

-- Add check constraints to ensure Khmer text is valid
-- These are optional - remove if they cause issues with existing data

-- Validate quiz titles can contain Khmer
ALTER TABLE public.quizzes 
DROP CONSTRAINT IF EXISTS quizzes_title_khmer_check;

ALTER TABLE public.quizzes 
ADD CONSTRAINT quizzes_title_khmer_check 
CHECK (validate_khmer_text(title));

-- Validate quiz questions can contain Khmer
ALTER TABLE public.quiz_questions 
DROP CONSTRAINT IF EXISTS quiz_questions_question_khmer_check;

ALTER TABLE public.quiz_questions 
ADD CONSTRAINT quiz_questions_question_khmer_check 
CHECK (validate_khmer_text(question));

-- Validate quiz explanations can contain Khmer
ALTER TABLE public.quiz_questions 
DROP CONSTRAINT IF EXISTS quiz_questions_explanation_khmer_check;

ALTER TABLE public.quiz_questions 
ADD CONSTRAINT quiz_questions_explanation_khmer_check 
CHECK (explanation IS NULL OR validate_khmer_text(explanation));

-- =====================================================
-- 6. CREATE INDEXES FOR KHMER TEXT SEARCH
-- =====================================================

-- Create GIN indexes for better text search with Khmer content
-- These help with searching Khmer text efficiently

-- Index for quiz titles (supports Khmer search)
DROP INDEX IF EXISTS idx_quizzes_title_gin;
CREATE INDEX idx_quizzes_title_gin ON public.quizzes USING gin(to_tsvector('simple', title));

-- Index for quiz questions (supports Khmer search)  
DROP INDEX IF EXISTS idx_quiz_questions_question_gin;
CREATE INDEX idx_quiz_questions_question_gin ON public.quiz_questions USING gin(to_tsvector('simple', question));

-- Index for course titles (supports Khmer search)
DROP INDEX IF EXISTS idx_courses_title_gin;
CREATE INDEX idx_courses_title_gin ON public.courses USING gin(to_tsvector('simple', title));

-- =====================================================
-- 7. UPDATE RLS POLICIES FOR KHMER CONTENT
-- =====================================================

-- Ensure Row Level Security policies work with Khmer content
-- These don't need changes but let's verify they exist

-- Verify quiz access policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('quizzes', 'quiz_questions') 
ORDER BY tablename, policyname;

-- =====================================================
-- 8. CREATE KHMER CONTENT STATISTICS VIEW
-- =====================================================

-- View to monitor Khmer content in the database
CREATE OR REPLACE VIEW khmer_content_stats AS
SELECT 
    'quizzes' as table_name,
    'title' as column_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN title ~ '[\x{1780}-\x{17FF}]' THEN 1 END) as khmer_records,
    ROUND(
        COUNT(CASE WHEN title ~ '[\x{1780}-\x{17FF}]' THEN 1 END)::numeric / 
        COUNT(*)::numeric * 100, 2
    ) as khmer_percentage
FROM public.quizzes
WHERE title IS NOT NULL AND title != ''

UNION ALL

SELECT 
    'quiz_questions' as table_name,
    'question' as column_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN question ~ '[\x{1780}-\x{17FF}]' THEN 1 END) as khmer_records,
    ROUND(
        COUNT(CASE WHEN question ~ '[\x{1780}-\x{17FF}]' THEN 1 END)::numeric / 
        COUNT(*)::numeric * 100, 2
    ) as khmer_percentage
FROM public.quiz_questions
WHERE question IS NOT NULL AND question != ''

UNION ALL

SELECT 
    'courses' as table_name,
    'title' as column_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN title ~ '[\x{1780}-\x{17FF}]' THEN 1 END) as khmer_records,
    ROUND(
        COUNT(CASE WHEN title ~ '[\x{1780}-\x{17FF}]' THEN 1 END)::numeric / 
        COUNT(*)::numeric * 100, 2
    ) as khmer_percentage
FROM public.courses
WHERE title IS NOT NULL AND title != '';

-- =====================================================
-- 9. GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION validate_khmer_text(text) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_khmer_json(text) TO authenticated;

-- Grant access to the statistics view
GRANT SELECT ON khmer_content_stats TO authenticated;

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================

-- Run these to verify everything is working:

-- Check database encoding
SELECT pg_encoding_to_char(encoding) as encoding FROM pg_database WHERE datname = current_database();

-- Test Khmer text validation
SELECT validate_khmer_text('ការសាកល្បងភាសាខ្មែរ') as valid_khmer;
SELECT validate_khmer_text('Test with Khmer: ភាសាខ្មែរ') as mixed_content;

-- Test JSON validation with Khmer
SELECT validate_khmer_json('{"title": "ការសាកល្បងភាសាខ្មែរ", "content": "តេស្ត"}') as valid_khmer_json;

-- Check current Khmer content statistics
SELECT * FROM khmer_content_stats;

-- =====================================================
-- NOTES FOR RUNNING IN SUPABASE:
-- =====================================================

/*
1. Copy and paste these commands into your Supabase SQL Editor
2. Run them one section at a time (use the section comments as guides)
3. If any constraint checks fail, you may have existing data that doesn't meet the validation
4. The validation functions are optional - you can skip sections 5 if needed
5. The indexes in section 6 will improve search performance for Khmer content
6. Monitor the khmer_content_stats view to track your Khmer content usage

IMPORTANT: 
- Test these changes in a development environment first
- Backup your data before making schema changes
- Some constraints may need to be adjusted based on your existing data
*/
