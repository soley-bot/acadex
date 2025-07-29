-- FIX 403 LESSON PROGRESS ERROR
-- This fixes the "mark lesson as complete" functionality

-- =============================================
-- 1. CHECK CURRENT LESSON_PROGRESS TABLE STATUS
-- =============================================

-- Check if lesson_progress table exists and its structure
SELECT 
    'lesson_progress table structure:' as info,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'lesson_progress' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check current RLS status
SELECT 
    'RLS Status for lesson_progress:' as info,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as status
FROM pg_tables 
WHERE tablename = 'lesson_progress' 
AND schemaname = 'public';

-- List current policies
SELECT 
    '📋 Current Lesson Progress Policies:' as info,
    policyname,
    cmd as operation
FROM pg_policies 
WHERE tablename = 'lesson_progress' 
AND schemaname = 'public'
ORDER BY cmd;

-- =============================================
-- 2. REMOVE RESTRICTIVE POLICIES
-- =============================================

-- Drop all existing lesson_progress policies
DROP POLICY IF EXISTS "Users can manage their own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "lesson_progress_user_manage" ON public.lesson_progress;
DROP POLICY IF EXISTS "lesson_progress_own_access" ON public.lesson_progress;
DROP POLICY IF EXISTS "lesson_progress_policy" ON public.lesson_progress;
DROP POLICY IF EXISTS "Admin can view all lesson progress" ON public.lesson_progress;

-- =============================================
-- 3. CREATE PERMISSIVE LESSON PROGRESS POLICIES
-- =============================================

-- Allow users to manage their own lesson progress
CREATE POLICY "lesson_progress_user_full_access" ON public.lesson_progress
    FOR ALL USING (
        auth.uid() = user_id  -- Users can manage their own progress
    ) WITH CHECK (
        auth.uid() = user_id  -- Users can only create progress for themselves
    );

-- Allow admins to view all lesson progress
CREATE POLICY "lesson_progress_admin_view" ON public.lesson_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );

-- =============================================
-- 4. TEST LESSON PROGRESS OPERATIONS
-- =============================================

-- Test if we can insert lesson progress
-- Note: Replace with actual user_id and lesson_id when testing
/*
INSERT INTO public.lesson_progress (user_id, lesson_id, is_completed, completed_at, time_spent_minutes)
VALUES (
    auth.uid(),  -- Current authenticated user
    'your-lesson-id-here',  -- Replace with actual lesson ID
    true,
    NOW(),
    5
) ON CONFLICT (user_id, lesson_id) 
DO UPDATE SET 
    is_completed = EXCLUDED.is_completed,
    completed_at = EXCLUDED.completed_at,
    time_spent_minutes = EXCLUDED.time_spent_minutes
RETURNING id, user_id, lesson_id, is_completed;
*/

-- Test selecting lesson progress for current user
SELECT 'Testing lesson progress access...' as test;

-- This should work for authenticated users
SELECT id, user_id, lesson_id, is_completed, completed_at
FROM public.lesson_progress 
WHERE user_id = auth.uid()
LIMIT 5;

-- =============================================
-- 5. VERIFY RELATED TABLES ACCESS
-- =============================================

-- Make sure course_lessons table is also accessible
-- (needed for lesson progress to work properly)
DROP POLICY IF EXISTS "course_lessons_public_read" ON public.course_lessons;
DROP POLICY IF EXISTS "course_lessons_select_all" ON public.course_lessons;

-- Create permissive policy for course lessons
CREATE POLICY "course_lessons_public_access" ON public.course_lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.course_modules cm
            JOIN public.courses c ON c.id = cm.course_id
            WHERE cm.id = module_id 
            AND (c.is_published = true OR auth.uid() IS NOT NULL)
        )
    );

-- =============================================
-- 6. GRANT NECESSARY PERMISSIONS
-- =============================================

-- Grant permissions for lesson progress operations
GRANT ALL ON public.lesson_progress TO authenticated;
GRANT SELECT ON public.lesson_progress TO authenticated;

-- Ensure sequences are accessible (for id generation)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================
-- 7. SUCCESS CONFIRMATION
-- =============================================

SELECT '🎉 LESSON PROGRESS 403 ERROR SHOULD NOW BE FIXED!' as message
UNION ALL
SELECT '✅ Users can now mark lessons as complete'
UNION ALL
SELECT '📊 Lesson progress tracking should work properly'
UNION ALL
SELECT '🔒 Users can only manage their own progress'
UNION ALL
SELECT '👨‍💼 Admins can view all lesson progress for analytics';
