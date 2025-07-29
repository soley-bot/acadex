-- Fix for missing columns in course_lessons table
-- Run this in Supabase SQL Editor to add the missing columns

-- Add missing columns to existing course_lessons table
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS duration VARCHAR(50);
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS is_preview BOOLEAN DEFAULT false;
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS video_url VARCHAR(500);
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Also ensure course_modules table exists and has the right structure
CREATE TABLE IF NOT EXISTS course_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure the foreign key relationship exists
DO $$ 
BEGIN
    -- Try to add the foreign key constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'course_lessons_module_id_fkey'
        AND table_name = 'course_lessons'
    ) THEN
        ALTER TABLE course_lessons 
        ADD CONSTRAINT course_lessons_module_id_fkey 
        FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add enhanced columns to courses table if they don't exist
ALTER TABLE courses ADD COLUMN IF NOT EXISTS learning_outcomes TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS prerequisites TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS certificate_enabled BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS estimated_completion_time VARCHAR(100);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS difficulty_rating INTEGER DEFAULT 1 CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5);

-- Verify the columns were added (optional - you can run this to check)
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'course_lessons' 
-- ORDER BY ordinal_position;
