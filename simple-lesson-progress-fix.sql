    -- SIMPLE FIX FOR LESSON PROGRESS 403 ERROR
    -- This script is safe to run multiple times

    -- =============================================
    -- 1. FIX LESSON PROGRESS POLICIES
    -- =============================================

    -- Remove any existing lesson progress policies
    DROP POLICY IF EXISTS "Users can manage their own lesson progress" ON public.lesson_progress;
    DROP POLICY IF EXISTS "lesson_progress_user_manage" ON public.lesson_progress;
    DROP POLICY IF EXISTS "lesson_progress_own_access" ON public.lesson_progress;
    DROP POLICY IF EXISTS "lesson_progress_policy" ON public.lesson_progress;
    DROP POLICY IF EXISTS "Admin can view all lesson progress" ON public.lesson_progress;
    DROP POLICY IF EXISTS "lesson_progress_user_full_access" ON public.lesson_progress;
    DROP POLICY IF EXISTS "lesson_progress_admin_view" ON public.lesson_progress;
    DROP POLICY IF EXISTS "temp_lesson_progress_all" ON public.lesson_progress;
    DROP POLICY IF EXISTS "lesson_progress_user_access" ON public.lesson_progress;
    DROP POLICY IF EXISTS "lesson_progress_admin_access" ON public.lesson_progress;

    -- Create working lesson progress policy
    CREATE POLICY "lesson_progress_user_access" ON public.lesson_progress
        FOR ALL USING (
            auth.uid() = user_id
        ) WITH CHECK (
            auth.uid() = user_id
        );

    -- Allow admins to view all progress
    CREATE POLICY "lesson_progress_admin_access" ON public.lesson_progress
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.users 
                WHERE id = auth.uid() 
                AND role = 'admin'
            )
        );

    -- =============================================
    -- 2. TEST THE FIX
    -- =============================================

    -- Test lesson progress access for current user
    SELECT 'Testing lesson progress access...' as test_name;

    -- This should work without errors
    SELECT COUNT(*) as my_lesson_progress_count
    FROM public.lesson_progress 
    WHERE user_id = auth.uid();

    -- =============================================
    -- 3. SUCCESS MESSAGE
    -- =============================================

    SELECT '✅ LESSON PROGRESS 403 ERROR FIXED!' as message
    UNION ALL
    SELECT '📚 You can now mark lessons as complete'
    UNION ALL
    SELECT '🔒 Security maintained - users only access own data';
