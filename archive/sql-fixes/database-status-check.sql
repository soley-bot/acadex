-- Quick Database Status Check
-- Run this in Supabase SQL Editor to understand current state

-- 1. Check if users table exists and has admin users
SELECT 'Users Table Status' as check_type, 
       count(*) as total_users,
       count(*) FILTER (WHERE role = 'admin') as admin_users,
       count(*) FILTER (WHERE role = 'instructor') as instructor_users
FROM users;

-- 2. Check if courses table exists and current count
SELECT 'Courses Table Status' as check_type,
       count(*) as total_courses,
       count(*) FILTER (WHERE is_published = true) as published_courses
FROM courses;

-- 3. Check if course_modules table exists
SELECT 'Course Modules Status' as check_type,
       count(*) as total_modules
FROM course_modules;

-- 4. Check current RLS policies on courses table
SELECT 'RLS Policies' as check_type,
       schemaname,
       tablename,
       policyname,
       permissive,
       roles,
       cmd,
       qual
FROM pg_policies 
WHERE tablename = 'courses';

-- 5. Test if admin user exists
SELECT 'Admin User Check' as check_type,
       id,
       email,
       name,
       role,
       created_at
FROM users 
WHERE role IN ('admin', 'instructor')
ORDER BY created_at DESC
LIMIT 3;

-- 6. Check table permissions
SELECT 'Table Permissions' as check_type,
       table_name,
       privilege_type,
       grantee
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name IN ('courses', 'course_modules', 'course_lessons')
AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;
