-- Test the actual join that's failing
-- This will help us see exactly what's happening

-- 1. Test simple enrollments query
SELECT id, user_id, course_id, enrolled_at
FROM public.enrollments
LIMIT 5;

-- 2. Test if users can be joined
SELECT e.id as enrollment_id, e.user_id, u.id as user_table_id, u.name, u.email
FROM public.enrollments e
LEFT JOIN public.users u ON e.user_id = u.id
LIMIT 5;

-- 3. Test the exact Supabase-style query structure
-- This mimics what Supabase PostgREST does internally
SELECT 
  e.*,
  u.id as user_id,
  u.name as user_name,
  u.email as user_email
FROM public.enrollments e
LEFT JOIN public.users u ON e.user_id = u.id
LIMIT 5;

-- 4. Check foreign key constraints
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='enrollments';
