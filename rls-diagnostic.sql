-- DIAGNOSTIC QUERY - Check current RLS policies and potential issues
-- Run this in Supabase SQL Editor to see current state

-- 1. Check all tables and their RLS status
SELECT 
    schemaname,
    tablename, 
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. Check all current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    permissive,
    roles,
    CASE 
        WHEN cmd = 'SELECT' THEN '🔍 Read'
        WHEN cmd = 'INSERT' THEN '➕ Create'
        WHEN cmd = 'UPDATE' THEN '✏️ Update'
        WHEN cmd = 'DELETE' THEN '🗑️ Delete'
        ELSE cmd
    END as action
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- 3. Check for tables without policies (potential issues)
SELECT 
    t.tablename,
    CASE 
        WHEN COUNT(p.policyname) = 0 THEN '⚠️ No Policies Found'
        ELSE CONCAT('✅ ', COUNT(p.policyname), ' policies')
    END as policy_status
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
GROUP BY t.tablename
ORDER BY t.tablename;

-- 4. Check auth.users trigger
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    CASE 
        WHEN trigger_name = 'on_auth_user_created' THEN '✅ User trigger exists'
        ELSE '⚠️ Unknown trigger'
    END as status
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- 5. Test if current user can access tables (if logged in)
DO $$
BEGIN
    -- Test basic access
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        BEGIN
            PERFORM COUNT(*) FROM public.users LIMIT 1;
            RAISE NOTICE '✅ Can access users table';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Cannot access users table: %', SQLERRM;
        END;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'courses') THEN
        BEGIN
            PERFORM COUNT(*) FROM public.courses LIMIT 1;
            RAISE NOTICE '✅ Can access courses table';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Cannot access courses table: %', SQLERRM;
        END;
    END IF;
END $$;

-- 6. Summary message
SELECT 
    'RLS DIAGNOSTIC COMPLETE' as message,
    NOW() as timestamp;
