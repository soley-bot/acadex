-- Fix RLS policies for course creation and management
-- Run this in your Supabase SQL editor

-- First, let's check if RLS is causing issues by temporarily disabling it
-- (We'll re-enable with proper policies)

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "course_modules_policy" ON course_modules;
DROP POLICY IF EXISTS "course_lessons_policy" ON course_lessons;
DROP POLICY IF EXISTS "course_resources_policy" ON course_resources;
DROP POLICY IF EXISTS "courses_instructor_policy" ON courses;
DROP POLICY IF EXISTS "courses_public_read" ON courses;
DROP POLICY IF EXISTS "course_modules_public_read" ON course_modules;
DROP POLICY IF EXISTS "course_lessons_public_read" ON course_lessons;
DROP POLICY IF EXISTS "course_resources_public_read" ON course_resources;

-- Create more permissive policies for course management

-- Courses: Allow instructors to manage their courses, and anyone to read published courses
CREATE POLICY "courses_instructor_manage" ON courses
FOR ALL USING (instructor_id = auth.uid());

CREATE POLICY "courses_read_published" ON courses
FOR SELECT USING (is_published = true OR instructor_id = auth.uid());

-- Course Modules: Allow instructors to manage modules for their courses, anyone to read published modules
CREATE POLICY "course_modules_instructor_manage" ON course_modules
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = course_modules.course_id 
    AND courses.instructor_id = auth.uid()
  )
);

CREATE POLICY "course_modules_read_published" ON course_modules
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = course_modules.course_id 
    AND (courses.is_published = true OR courses.instructor_id = auth.uid())
  )
);

-- Course Lessons: Allow instructors to manage lessons for their modules, anyone to read published lessons
CREATE POLICY "course_lessons_instructor_manage" ON course_lessons
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM course_modules 
    JOIN courses ON courses.id = course_modules.course_id
    WHERE course_modules.id = course_lessons.module_id 
    AND courses.instructor_id = auth.uid()
  )
);

CREATE POLICY "course_lessons_read_published" ON course_lessons
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM course_modules 
    JOIN courses ON courses.id = course_modules.course_id
    WHERE course_modules.id = course_lessons.module_id 
    AND (courses.is_published = true OR courses.instructor_id = auth.uid())
  )
);

-- Course Resources: Allow instructors to manage resources, anyone to read published resources
CREATE POLICY "course_resources_instructor_manage" ON course_resources
FOR ALL USING (
  -- For course-level resources
  (course_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = course_resources.course_id 
    AND courses.instructor_id = auth.uid()
  ))
  OR
  -- For lesson-level resources
  (lesson_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM course_lessons
    JOIN course_modules ON course_modules.id = course_lessons.module_id
    JOIN courses ON courses.id = course_modules.course_id
    WHERE course_lessons.id = course_resources.lesson_id 
    AND courses.instructor_id = auth.uid()
  ))
);

CREATE POLICY "course_resources_read_published" ON course_resources
FOR SELECT USING (
  -- For course-level resources
  (course_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = course_resources.course_id 
    AND (courses.is_published = true OR courses.instructor_id = auth.uid())
  ))
  OR
  -- For lesson-level resources
  (lesson_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM course_lessons
    JOIN course_modules ON course_modules.id = course_lessons.module_id
    JOIN courses ON courses.id = course_modules.course_id
    WHERE course_lessons.id = course_resources.lesson_id 
    AND (courses.is_published = true OR courses.instructor_id = auth.uid())
  ))
);

-- Enrollments: Allow users to read their own enrollments
DROP POLICY IF EXISTS "enrollments_policy" ON enrollments;
CREATE POLICY "enrollments_user_manage" ON enrollments
FOR ALL USING (user_id = auth.uid());

-- Lesson Progress: Allow users to manage their own progress
DROP POLICY IF EXISTS "lesson_progress_policy" ON lesson_progress;
CREATE POLICY "lesson_progress_user_manage" ON lesson_progress
FOR ALL USING (user_id = auth.uid());

-- Ensure RLS is enabled on all tables
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT ALL ON course_modules TO authenticated;
GRANT ALL ON course_lessons TO authenticated;  
GRANT ALL ON course_resources TO authenticated;
GRANT ALL ON courses TO authenticated;
GRANT ALL ON enrollments TO authenticated;
GRANT ALL ON lesson_progress TO authenticated;

-- For anonymous users (public access to published content)
GRANT SELECT ON courses TO anon;
GRANT SELECT ON course_modules TO anon;
GRANT SELECT ON course_lessons TO anon;
GRANT SELECT ON course_resources TO anon;

-- Debug queries - run these to check your data
/*
-- Check if the course exists and has modules
SELECT c.id, c.title, c.is_published, 
       COUNT(cm.id) as module_count,
       COUNT(cl.id) as lesson_count
FROM courses c
LEFT JOIN course_modules cm ON c.id = cm.course_id
LEFT JOIN course_lessons cl ON cm.id = cl.module_id
WHERE c.id = 'dbc23169-b2a7-4640-82cf-35b668a95b7'  -- Replace with your course ID
GROUP BY c.id, c.title, c.is_published;

-- Check enrollments for the course
SELECT * FROM enrollments 
WHERE course_id = 'dbc23169-b2a7-4640-82cf-35b668a95b7';  -- Replace with your course ID

-- Check current user auth
SELECT auth.uid() as current_user_id;
*/

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
