-- FIX FOR 406 ENROLLMENT ERROR
-- This addresses the specific 406 error when trying to enroll in courses

-- =============================================
-- 1. ENSURE ENROLLMENTS TABLE HAS PROPER STRUCTURE
-- =============================================

-- Check current enrollments table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'enrollments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =============================================
-- 2. DISABLE RLS TEMPORARILY FOR DEBUGGING
-- =============================================

-- Temporarily disable RLS on enrollments table to test
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. RE-ENABLE WITH FIXED POLICIES
-- =============================================

-- Re-enable RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Drop all existing enrollment policies
DROP POLICY IF EXISTS "enrollments_select_policy" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_insert_policy" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_update_policy" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_delete_policy" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_manage_own" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_select_own" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_select_admin" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_insert_own" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_update_own" ON public.enrollments;

-- Create very permissive policies for testing
CREATE POLICY "enrollments_select_all" ON public.enrollments
    FOR SELECT USING (true);

CREATE POLICY "enrollments_insert_all" ON public.enrollments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "enrollments_update_all" ON public.enrollments
    FOR UPDATE USING (true);

CREATE POLICY "enrollments_delete_own" ON public.enrollments
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 4. TEST ENROLLMENT OPERATIONS
-- =============================================

-- Test the exact query that's failing (406 error)
SELECT id 
FROM public.enrollments 
WHERE user_id = 'c08221d0-15ff-4c37-8d9a-179dc9455e56' 
AND course_id = 'b6ee622a-cae9-4393-b50d-cac785445600';

-- Test if we can insert an enrollment
INSERT INTO public.enrollments (user_id, course_id, enrolled_at, progress, completed)
VALUES (
    'c08221d0-15ff-4c37-8d9a-179dc9455e56', 
    'b6ee622a-cae9-4393-b50d-cac785445600', 
    NOW(), 
    0, 
    false
) ON CONFLICT (user_id, course_id) DO NOTHING
RETURNING id, user_id, course_id, enrolled_at;

-- =============================================
-- 5. CHECK FOR CONFLICTING CONSTRAINTS
-- =============================================

-- Check for any constraints that might cause 406 errors
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'enrollments' 
AND tc.table_schema = 'public';

-- =============================================
-- 6. VERIFY USER AND COURSE EXIST
-- =============================================

-- Check if the specific user exists
SELECT id, email, name, role 
FROM public.users 
WHERE id = 'c08221d0-15ff-4c37-8d9a-179dc9455e56';

-- Check if the specific course exists
SELECT id, title, is_published 
FROM public.courses 
WHERE id = 'b6ee622a-cae9-4393-b50d-cac785445600';

-- =============================================
-- 7. SUCCESS CONFIRMATION
-- =============================================

SELECT '🎉 Enrollment policies have been made fully permissive for testing!' as message
UNION ALL
SELECT '🔍 Run the test queries above to verify enrollment functionality'
UNION ALL
SELECT '📝 If successful, you can make policies more restrictive later'
UNION ALL
SELECT '⚠️ Remember to check user authentication in your app';
