-- Quick fix for the missing is_preview column
-- Run this in Supabase SQL Editor if you don't want to run the full enhanced schema

-- Add the missing is_preview column to course_lessons table
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS is_preview BOOLEAN DEFAULT false;

-- If the course_lessons table doesn't exist, create it with minimal structure
CREATE TABLE IF NOT EXISTS course_lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url VARCHAR(500),
    duration VARCHAR(50),
    order_index INTEGER NOT NULL DEFAULT 0,
    is_preview BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_modules table if it doesn't exist (required for course_lessons)
CREATE TABLE IF NOT EXISTS course_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add enhanced fields to courses table if they don't exist
ALTER TABLE courses ADD COLUMN IF NOT EXISTS learning_outcomes TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS prerequisites TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS certificate_enabled BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS estimated_completion_time VARCHAR(100);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS difficulty_rating INTEGER DEFAULT 1 CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5);
