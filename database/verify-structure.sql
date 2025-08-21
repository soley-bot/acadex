-- Run this to confirm your database structure is correct
-- No changes needed - just verification

-- 1. Check enrollments table structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'enrollments'
ORDER BY ordinal_position;

-- 2. Check users table structure  
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Test the join that was failing (should work now)
SELECT 
  e.id,
  e.user_id,
  e.course_id,
  e.enrolled_at,
  u.name as user_name,
  u.email as user_email
FROM public.enrollments e
LEFT JOIN public.users u ON e.user_id = u.id
LIMIT 5;
