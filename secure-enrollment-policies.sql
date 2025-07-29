-- PROPER ENROLLMENT POLICIES (SECURE VERSION)
-- This replaces the temporary super-permissive policy with secure ones

-- =============================================
-- 1. REMOVE TEMPORARY POLICY
-- =============================================

DROP POLICY IF EXISTS "temp_enrollments_all_access" ON public.enrollments;

-- =============================================
-- 2. CREATE PROPER SECURE POLICIES
-- =============================================

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "enrollments_view_own" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_create_own" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_update_own" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_delete_own" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_admin_access" ON public.enrollments;

-- Users can view their own enrollments
CREATE POLICY "enrollments_view_own" ON public.enrollments
    FOR SELECT USING (
        auth.uid() = user_id
    );

-- Users can create enrollments for themselves
CREATE POLICY "enrollments_create_own" ON public.enrollments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

-- Users can update their own enrollment progress
CREATE POLICY "enrollments_update_own" ON public.enrollments
    FOR UPDATE USING (
        auth.uid() = user_id
    );

-- Only users can delete their own enrollments
CREATE POLICY "enrollments_delete_own" ON public.enrollments
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- Admins can see all enrollments
CREATE POLICY "enrollments_admin_access" ON public.enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- =============================================
-- 2B. SECURE LESSON PROGRESS POLICIES
-- =============================================

-- Drop temporary lesson progress policies
DROP POLICY IF EXISTS "lesson_progress_user_full_access" ON public.lesson_progress;
DROP POLICY IF EXISTS "lesson_progress_admin_view" ON public.lesson_progress;
DROP POLICY IF EXISTS "temp_lesson_progress_all" ON public.lesson_progress;

-- Users can manage their own lesson progress
CREATE POLICY "lesson_progress_own_access" ON public.lesson_progress
    FOR ALL USING (
        auth.uid() = user_id
    ) WITH CHECK (
        auth.uid() = user_id
    );

-- Admins can view all lesson progress for analytics
CREATE POLICY "lesson_progress_admin_view" ON public.lesson_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- =============================================
-- 3. TEST THE SECURE POLICIES
-- =============================================

-- This should work when you're logged in as the user
SELECT 'Testing secure policies...' as info;

-- Test enrollment check (should work with proper auth)
SELECT id, user_id, course_id, enrolled_at
FROM public.enrollments 
WHERE user_id = auth.uid()  -- Uses authenticated user
LIMIT 5;

-- =============================================
-- 4. WHAT POLICIES PREVENT
-- =============================================

/*
WITHOUT POLICIES (dangerous):
- Any user can see ALL enrollments
- Users can enroll others in courses
- Users can modify other people's progress
- No audit trail or security

WITH PROPER POLICIES (secure):
- Users only see their own enrollments
- Users can only enroll themselves
- Progress updates are restricted to course owner
- Admins have oversight capabilities
*/

SELECT '🔒 Secure enrollment policies are now active!' as message
UNION ALL 
SELECT '✅ Users can only access their own enrollment data'
UNION ALL
SELECT '🛡️ Prevents unauthorized access to other users enrollments'
UNION ALL
SELECT '👨‍💼 Admins retain full access for management';
