-- Diagnostic query to check table structure and relationships
-- Run this in Supabase SQL Editor to understand the current state

-- 1. Check if users table exists and its structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Check enrollments table structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'enrollments'
ORDER BY ordinal_position;

-- 3. Check what tables exist in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 4. If users table exists, check sample data
SELECT id, email, 
       CASE 
         WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') 
         THEN 'name column exists'
         WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name')
         THEN 'full_name column exists'
         ELSE 'neither name nor full_name exists'
       END as name_column_status
FROM public.users 
LIMIT 3;
