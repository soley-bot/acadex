-- =====================================================
-- ESSENTIAL KHMER SUPPORT SQL - RUN THIS FIRST
-- =====================================================

-- These are the ESSENTIAL SQL commands to run in Supabase
-- for immediate Khmer language support in quiz generation

-- =====================================================
-- 1. VERIFY DATABASE ENCODING (Should already be UTF8)
-- =====================================================

SELECT pg_encoding_to_char(encoding) as database_encoding 
FROM pg_database 
WHERE datname = current_database();

-- Expected result: UTF8 (this should already be correct in Supabase)

-- =====================================================
-- 2. CREATE BASIC KHMER VALIDATION FUNCTION
-- =====================================================

-- Function to validate mixed-language text (English + Khmer)
CREATE OR REPLACE FUNCTION validate_mixed_language_text(input_text text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    -- Allow NULL/empty text
    IF input_text IS NULL OR input_text = '' THEN
        RETURN true;
    END IF;
    
    -- Basic length check (mixed content can be longer)
    IF char_length(input_text) > 8000 THEN
        RETURN false;
    END IF;
    
    -- Check for JSON-breaking characters
    IF input_text ~ '[\x00-\x1F\x7F]' THEN
        RETURN false; -- Control characters
    END IF;
    
    -- Check for unescaped quotes that break JSON
    IF input_text ~ '(?<!\\)"' THEN
        RETURN false; -- Unescaped double quotes
    END IF;
    
    -- Allow mixed English, Khmer, numbers, and basic punctuation
    -- This is permissive to avoid blocking valid mixed content
    RETURN true;
END;
$$;

-- This function helps validate Khmer text before JSON operations
CREATE OR REPLACE FUNCTION validate_khmer_text(input_text text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    -- Allow NULL/empty text
    IF input_text IS NULL OR input_text = '' THEN
        RETURN true;
    END IF;
    
    -- Basic length check (Khmer text can be longer due to Unicode)
    IF char_length(input_text) > 5000 THEN
        RETURN false;
    END IF;
    
    -- Check for reasonable characters (including Khmer Unicode range)
    RETURN true; -- For now, allow all text to avoid blocking existing data
END;
$$;

-- =====================================================
-- 3. CREATE JSON VALIDATION FUNCTION
-- =====================================================

-- This validates JSON that contains Khmer text
CREATE OR REPLACE FUNCTION validate_khmer_json(json_text text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    -- Test if it's valid JSON
    BEGIN
        PERFORM json_text::json;
        RETURN true;
    EXCEPTION WHEN OTHERS THEN
        RETURN false;
    END;
END;
$$;

-- =====================================================
-- 4. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION validate_mixed_language_text(text) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_khmer_text(text) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_khmer_json(text) TO authenticated;

-- =====================================================
-- 5. TEST THE FUNCTIONS
-- =====================================================

-- Test mixed language validation
SELECT validate_mixed_language_text('This concept គឺជាមូលដ្ឋាន means foundation in English') as test_mixed_validation;

-- Test pure Khmer text validation
SELECT validate_khmer_text('ការសាកល្បងភាសាខ្មែរ') as test_khmer_validation;

-- Test JSON with mixed content
SELECT validate_khmer_json('{"explanation": "This concept គឺជាមូលដ្ឋាន means foundation", "answer": "A"}') as test_mixed_json;

-- =====================================================
-- 6. VERIFY CURRENT SCHEMA IS KHMER-READY
-- =====================================================

-- Check if text fields can handle Khmer (they should already)
SELECT 
    table_name, 
    column_name, 
    data_type, 
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('quizzes', 'quiz_questions', 'courses')
    AND data_type IN ('text', 'character varying')
ORDER BY table_name, column_name;
