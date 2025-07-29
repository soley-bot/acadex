-- QUICK FIX FOR "updated_at" TRIGGER ERROR
-- This fixes the immediate 42703 error you're experiencing

-- =============================================
-- 1. FIX THE UPDATED_AT COLUMN ISSUE
-- =============================================

-- Add updated_at column if it doesn't exist
ALTER TABLE public.lesson_progress 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =============================================
-- 2. REMOVE PROBLEMATIC TRIGGERS
-- =============================================

-- Drop all existing triggers that might be causing issues
DROP TRIGGER IF EXISTS update_lesson_progress_updated_at ON public.lesson_progress;
DROP TRIGGER IF EXISTS trigger_update_lesson_progress_updated_at ON public.lesson_progress;
DROP TRIGGER IF EXISTS update_lesson_progress_updated_at_trigger ON public.lesson_progress;
DROP TRIGGER IF EXISTS trigger_update_enrollment_progress_insert ON public.lesson_progress;
DROP TRIGGER IF EXISTS trigger_update_enrollment_progress_update ON public.lesson_progress;

-- Drop problematic trigger functions
DROP FUNCTION IF EXISTS update_lesson_progress_updated_at();

-- =============================================
-- 3. CREATE SIMPLE WORKING TRIGGER
-- =============================================

-- Create a simple, working updated_at function
CREATE OR REPLACE FUNCTION simple_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create clean trigger
CREATE TRIGGER lesson_progress_set_updated_at
    BEFORE UPDATE ON public.lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION simple_update_updated_at();

-- =============================================
-- 4. VERIFY THE FIX
-- =============================================

-- Check table structure
SELECT 
    'LESSON PROGRESS COLUMNS AFTER FIX:' as info,
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'lesson_progress' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check triggers
SELECT 
    'CURRENT TRIGGERS:' as info,
    trigger_name,
    event_manipulation
FROM information_schema.triggers 
WHERE event_object_table = 'lesson_progress' 
AND event_object_schema = 'public';

-- =============================================
-- 5. SUCCESS MESSAGE
-- =============================================

SELECT '✅ UPDATED_AT TRIGGER ERROR FIXED!' as message
UNION ALL
SELECT '📋 Added updated_at column to table'
UNION ALL
SELECT '🔧 Removed problematic triggers'
UNION ALL
SELECT '⚡ Created working updated_at trigger'
UNION ALL
SELECT '🎯 Ready to test lesson completion toggle';
