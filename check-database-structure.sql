-- Database structure verification queries
-- Run these in Supabase SQL Editor to check your current table structure

-- 1. Check if course_lessons table exists and its columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'course_lessons' 
ORDER BY ordinal_position;

-- 2. Check if course_modules table exists and its columns  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'course_modules' 
ORDER BY ordinal_position;

-- 3. Check courses table for enhanced columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
AND column_name IN ('learning_outcomes', 'prerequisites', 'tags', 'certificate_enabled', 'estimated_completion_time', 'difficulty_rating')
ORDER BY ordinal_position;

-- 4. Check foreign key constraints
SELECT 
    tc.constraint_name, 
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
AND tc.table_name IN ('course_lessons', 'course_modules');
