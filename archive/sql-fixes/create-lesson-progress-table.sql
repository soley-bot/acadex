-- SIMPLE LESSON PROGRESS TABLE CREATION
-- Run this if the lesson_progress table has issues

-- =============================================
-- 1. CHECK AND CREATE LESSON PROGRESS TABLE
-- =============================================

-- Create lesson_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique combination of user and lesson
    UNIQUE(user_id, lesson_id)
);

-- =============================================
-- 2. ADD UPDATED_AT TRIGGER
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_lesson_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_lesson_progress_updated_at ON public.lesson_progress;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_lesson_progress_updated_at
    BEFORE UPDATE ON public.lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_lesson_progress_updated_at();

-- =============================================
-- 3. ENABLE RLS AND CREATE POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "lesson_progress_user_access_v3" ON public.lesson_progress;
DROP POLICY IF EXISTS "lesson_progress_admin_access_v3" ON public.lesson_progress;

-- Users can manage their own lesson progress
CREATE POLICY "lesson_progress_user_access_v3" ON public.lesson_progress
    FOR ALL USING (
        auth.uid() = user_id
    ) WITH CHECK (
        auth.uid() = user_id
    );

-- Admins can view all lesson progress
CREATE POLICY "lesson_progress_admin_access_v3" ON public.lesson_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- =============================================
-- 4. TEST THE TABLE SETUP
-- =============================================

-- Verify table structure
SELECT 
    'LESSON PROGRESS TABLE STRUCTURE:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'lesson_progress' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check unique constraints
SELECT 
    'UNIQUE CONSTRAINTS:' as info,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'lesson_progress' 
AND table_schema = 'public'
AND constraint_type = 'UNIQUE';

-- =============================================
-- 5. SUCCESS MESSAGE
-- =============================================

SELECT '✅ LESSON PROGRESS TABLE SETUP COMPLETE!' as message
UNION ALL
SELECT '📋 Table created with proper structure'
UNION ALL
SELECT '🔒 RLS policies configured'
UNION ALL
SELECT '⚡ Updated_at trigger added'
UNION ALL
SELECT '🎯 Ready for lesson completion tracking';
