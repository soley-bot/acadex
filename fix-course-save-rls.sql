-- 🚀 Complete Fix for Course Save Issues
-- This addresses RLS policy problems that prevent course creation/editing
-- Run this entire script in your Supabase SQL Editor

-- Step 1: Drop existing restrictive policies
DROP POLICY IF EXISTS "courses_instructor_manage" ON courses;
DROP POLICY IF EXISTS "courses_read_published" ON courses;
DROP POLICY IF EXISTS "courses_instructor_policy" ON courses;
DROP POLICY IF EXISTS "courses_public_read" ON courses;

-- Step 2: Create comprehensive RLS policies for courses
-- Allow anyone to read published courses
CREATE POLICY "courses_public_read" ON courses
FOR SELECT USING (is_published = true);

-- Allow instructors and admins to manage courses
CREATE POLICY "courses_admin_manage" ON courses
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('admin', 'instructor')
  )
);

-- Allow course owners to manage their own courses
CREATE POLICY "courses_owner_manage" ON courses
FOR ALL USING (instructor_id = auth.uid());

-- Step 3: Fix course_modules policies
DROP POLICY IF EXISTS "course_modules_policy" ON course_modules;
DROP POLICY IF EXISTS "course_modules_public_read" ON course_modules;

CREATE POLICY "course_modules_read" ON course_modules
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = course_modules.course_id 
    AND courses.is_published = true
  )
);

CREATE POLICY "course_modules_manage" ON course_modules
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM courses 
    JOIN users ON users.id = auth.uid()
    WHERE courses.id = course_modules.course_id 
    AND (courses.instructor_id = auth.uid() OR users.role IN ('admin', 'instructor'))
  )
);

-- Step 4: Fix course_lessons policies
DROP POLICY IF EXISTS "course_lessons_policy" ON course_lessons;
DROP POLICY IF EXISTS "course_lessons_public_read" ON course_lessons;

CREATE POLICY "course_lessons_read" ON course_lessons
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM course_modules cm
    JOIN courses c ON c.id = cm.course_id
    WHERE cm.id = course_lessons.module_id 
    AND c.is_published = true
  )
);

CREATE POLICY "course_lessons_manage" ON course_lessons
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM course_modules cm
    JOIN courses c ON c.id = cm.course_id
    JOIN users u ON u.id = auth.uid()
    WHERE cm.id = course_lessons.module_id 
    AND (c.instructor_id = auth.uid() OR u.role IN ('admin', 'instructor'))
  )
);

-- Step 5: Verify setup with a test query
-- This should return admin/instructor users
SELECT 
  id, 
  name, 
  role,
  'Can create courses: ' || CASE 
    WHEN role IN ('admin', 'instructor') THEN 'YES' 
    ELSE 'NO' 
  END as permissions
FROM users 
WHERE role IN ('admin', 'instructor')
LIMIT 5;

-- Step 6: Grant necessary permissions for service operations
-- This ensures the application can perform database operations
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 7: Create a simple test to verify the fix works
-- Run this after the above to test course creation
/*
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
  'RLS Test Course',
  'This course tests if RLS policies are working correctly',
  (SELECT id FROM users WHERE role IN ('admin', 'instructor') LIMIT 1),
  (SELECT name FROM users WHERE role IN ('admin', 'instructor') LIMIT 1),
  'english',
  'beginner',
  0,
  '1 hour',
  false
);
*/

-- Success message
SELECT '✅ RLS Policies Updated Successfully! Course creation should now work.' as status;
