-- NUCLEAR OPTION: Disable RLS Completely
-- This will fix the issue immediately but reduces security
-- Use for development/testing only

-- Disable RLS on all course-related tables
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_resources DISABLE ROW LEVEL SECURITY;

-- Grant full permissions to authenticated users
GRANT ALL ON courses TO authenticated;
GRANT ALL ON course_modules TO authenticated;
GRANT ALL ON course_lessons TO authenticated;
GRANT ALL ON course_resources TO authenticated;

-- Test query - this should work immediately
INSERT INTO courses (
  title, 
  description, 
  instructor_id, 
  instructor_name,
  category,
  level,
  price,
  duration,
  is_published
) VALUES (
  'Test Course - RLS Disabled',
  'This should work now',
  (SELECT id FROM users LIMIT 1),
  (SELECT name FROM users LIMIT 1),
  'english',
  'beginner',
  0,
  '1 hour',
  false
);

SELECT 'RLS DISABLED - Course saving should work now!' as status;
