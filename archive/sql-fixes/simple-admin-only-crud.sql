-- Simple Admin-Only CRUD Solution
-- This makes course management super simple: only admins can create/edit/delete
-- Run this in your Supabase SQL Editor

-- Step 1: Drop all existing restrictive policies
DROP POLICY IF EXISTS "courses_public_read" ON courses;
DROP POLICY IF EXISTS "courses_admin_manage" ON courses;
DROP POLICY IF EXISTS "courses_owner_manage" ON courses;
DROP POLICY IF EXISTS "courses_instructor_manage" ON courses;
DROP POLICY IF EXISTS "courses_read_published" ON courses;

-- Step 2: Create simple admin-only policies for courses
-- Allow anyone to read published courses
CREATE POLICY "anyone_can_read_published_courses" ON courses
FOR SELECT USING (is_published = true);

-- Allow only admins to do everything (create, update, delete)
CREATE POLICY "admins_can_do_everything" ON courses
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Step 3: Fix course_modules policies 
DROP POLICY IF EXISTS "course_modules_read" ON course_modules;
DROP POLICY IF EXISTS "course_modules_manage" ON course_modules;

-- Anyone can read modules from published courses
CREATE POLICY "anyone_can_read_published_modules" ON course_modules
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = course_modules.course_id 
    AND courses.is_published = true
  )
);

-- Only admins can manage modules
CREATE POLICY "admins_can_manage_modules" ON course_modules
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Step 4: Fix course_lessons policies
DROP POLICY IF EXISTS "course_lessons_read" ON course_lessons;
DROP POLICY IF EXISTS "course_lessons_manage" ON course_lessons;

-- Anyone can read lessons from published courses
CREATE POLICY "anyone_can_read_published_lessons" ON course_lessons
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM course_modules cm
    JOIN courses c ON c.id = cm.course_id
    WHERE cm.id = course_lessons.module_id 
    AND c.is_published = true
  )
);

-- Only admins can manage lessons
CREATE POLICY "admins_can_manage_lessons" ON course_lessons
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Step 5: Ensure you have at least one admin user
-- Check current admin users
SELECT 'Current Admin Users:' as info, count(*) as admin_count
FROM users WHERE role = 'admin';

-- If no admin users exist, make the first user an admin
UPDATE users 
SET role = 'admin' 
WHERE id = (SELECT id FROM users ORDER BY created_at LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin');

-- Step 6: Test the setup
SELECT 
  'Admin Users Who Can Create Courses:' as info,
  name, 
  email, 
  role,
  created_at
FROM users 
WHERE role = 'admin'
ORDER BY created_at;

-- Success message
SELECT '✅ Simple Admin-Only CRUD Setup Complete!' as status,
       'Only admin users can now create/edit/delete courses' as description;
