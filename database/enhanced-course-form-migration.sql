-- =====================================================
-- ENHANCED COURSE FORM DATABASE MIGRATION
-- =====================================================
-- This migration adds the missing fields required for the enhanced course form
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. ADD MISSING FIELDS TO course_lessons TABLE
-- =====================================================

-- Add course_id to course_lessons (for direct course linkage)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_lessons' AND column_name = 'course_id') THEN
        ALTER TABLE public.course_lessons 
        ADD COLUMN course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;
        
        -- Populate course_id from existing module relationships
        UPDATE public.course_lessons 
        SET course_id = (
            SELECT cm.course_id 
            FROM public.course_modules cm 
            WHERE cm.id = course_lessons.module_id
        );
        
        -- Make course_id NOT NULL after populating
        ALTER TABLE public.course_lessons 
        ALTER COLUMN course_id SET NOT NULL;
        
        RAISE NOTICE 'Added course_id column to course_lessons and populated from modules';
    ELSE
        RAISE NOTICE 'course_id column already exists in course_lessons';
    END IF;
END $$;

-- Add quiz_id to course_lessons (for lesson quiz attachment)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_lessons' AND column_name = 'quiz_id') THEN
        ALTER TABLE public.course_lessons 
        ADD COLUMN quiz_id UUID REFERENCES public.quizzes(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Added quiz_id column to course_lessons';
    ELSE
        RAISE NOTICE 'quiz_id column already exists in course_lessons';
    END IF;
END $$;

-- 2. CREATE ADDITIONAL INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for course_lessons course_id
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON public.course_lessons(course_id);

-- Index for course_lessons quiz_id
CREATE INDEX IF NOT EXISTS idx_course_lessons_quiz_id ON public.course_lessons(quiz_id) WHERE quiz_id IS NOT NULL;

-- Composite index for course lesson ordering
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_order ON public.course_lessons(course_id, order_index);

-- 3. UPDATE RLS POLICIES FOR course_lessons
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "course_lessons_read_policy" ON public.course_lessons;
DROP POLICY IF EXISTS "course_lessons_insert_policy" ON public.course_lessons;
DROP POLICY IF EXISTS "course_lessons_update_policy" ON public.course_lessons;
DROP POLICY IF EXISTS "course_lessons_delete_policy" ON public.course_lessons;

-- Create comprehensive RLS policies for course_lessons
CREATE POLICY "course_lessons_read_policy" ON public.course_lessons
  FOR SELECT
  USING (
    -- Allow if user is admin
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR
    -- Allow if user is instructor of the course
    EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_lessons.course_id 
      AND c.instructor_id = auth.uid()
    )
    OR
    -- Allow if lesson is published and user is enrolled
    (
      is_published = true 
      AND EXISTS (
        SELECT 1 FROM public.enrollments e 
        WHERE e.course_id = course_lessons.course_id 
        AND e.user_id = auth.uid()
      )
    )
    OR
    -- Allow if lesson is free preview
    is_free_preview = true
  );

CREATE POLICY "course_lessons_insert_policy" ON public.course_lessons
  FOR INSERT
  WITH CHECK (
    -- Allow if user is admin
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR
    -- Allow if user is instructor of the course
    EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_lessons.course_id 
      AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "course_lessons_update_policy" ON public.course_lessons
  FOR UPDATE
  USING (
    -- Allow if user is admin
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR
    -- Allow if user is instructor of the course
    EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_lessons.course_id 
      AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "course_lessons_delete_policy" ON public.course_lessons
  FOR DELETE
  USING (
    -- Allow if user is admin
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    OR
    -- Allow if user is instructor of the course
    EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_lessons.course_id 
      AND c.instructor_id = auth.uid()
    )
  );

-- 4. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get course content structure
CREATE OR REPLACE FUNCTION get_course_content(course_uuid UUID)
RETURNS TABLE (
  module_id UUID,
  module_title TEXT,
  module_description TEXT,
  module_order INTEGER,
  lesson_id UUID,
  lesson_title TEXT,
  lesson_description TEXT,
  lesson_content TEXT,
  lesson_video_url TEXT,
  lesson_duration_minutes INTEGER,
  lesson_order INTEGER,
  lesson_is_published BOOLEAN,
  lesson_is_free_preview BOOLEAN,
  lesson_quiz_id UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id as module_id,
    cm.title as module_title,
    cm.description as module_description,
    cm.order_index as module_order,
    cl.id as lesson_id,
    cl.title as lesson_title,
    cl.description as lesson_description,
    cl.content as lesson_content,
    cl.video_url as lesson_video_url,
    cl.duration_minutes as lesson_duration_minutes,
    cl.order_index as lesson_order,
    cl.is_published as lesson_is_published,
    cl.is_free_preview as lesson_is_free_preview,
    cl.quiz_id as lesson_quiz_id
  FROM public.course_modules cm
  LEFT JOIN public.course_lessons cl ON cm.id = cl.module_id
  WHERE cm.course_id = course_uuid
  ORDER BY cm.order_index, cl.order_index;
END;
$$;

-- Function to count course content
CREATE OR REPLACE FUNCTION get_course_stats(course_uuid UUID)
RETURNS TABLE (
  total_modules INTEGER,
  total_lessons INTEGER,
  total_duration_minutes INTEGER,
  published_lessons INTEGER,
  free_preview_lessons INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT cm.id)::INTEGER as total_modules,
    COUNT(cl.id)::INTEGER as total_lessons,
    COALESCE(SUM(cl.duration_minutes), 0)::INTEGER as total_duration_minutes,
    COUNT(cl.id) FILTER (WHERE cl.is_published = true)::INTEGER as published_lessons,
    COUNT(cl.id) FILTER (WHERE cl.is_free_preview = true)::INTEGER as free_preview_lessons
  FROM public.course_modules cm
  LEFT JOIN public.course_lessons cl ON cm.id = cl.module_id
  WHERE cm.course_id = course_uuid;
END;
$$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if course_lessons table has all required columns
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_lessons' AND column_name = 'course_id') 
    THEN '✅ course_id column exists'
    ELSE '❌ course_id column missing'
  END as course_id_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_lessons' AND column_name = 'quiz_id') 
    THEN '✅ quiz_id column exists'
    ELSE '❌ quiz_id column missing'
  END as quiz_id_status;

-- Show sample of course_lessons structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'course_lessons' 
ORDER BY ordinal_position;
