-- =====================================================
-- ACADEX DATABASE UPDATE - ENHANCED COURSE STRUCTURE
-- =====================================================
-- Run this script in your Supabase SQL Editor to add the enhanced course structure
-- that your application expects for Phase 3 security features
-- =====================================================

-- 1. ADD ENHANCED COURSE CONTENT TABLES
-- =====================================================

-- Course Modules Table
CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, order_index)
);

-- Course Lessons Table
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  is_free_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_id, order_index)
);

-- Course Resources Table
CREATE TABLE IF NOT EXISTS public.course_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes BIGINT,
  is_downloadable BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (course_id IS NOT NULL OR lesson_id IS NOT NULL)
);

-- Lesson Progress Table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  watch_time_minutes INTEGER DEFAULT 0,
  last_position_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- 2. UPDATE EXISTING TABLES FOR ENHANCED FEATURES
-- =====================================================

-- Add missing columns to courses table if they don't exist
DO $$ 
BEGIN
  -- Add thumbnail_url if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'thumbnail_url') THEN
    ALTER TABLE public.courses ADD COLUMN thumbnail_url TEXT;
  END IF;

  -- Add video_preview_url if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'video_preview_url') THEN
    ALTER TABLE public.courses ADD COLUMN video_preview_url TEXT;
  END IF;

  -- Add tags if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'tags') THEN
    ALTER TABLE public.courses ADD COLUMN tags TEXT[];
  END IF;

  -- Add prerequisites if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'prerequisites') THEN
    ALTER TABLE public.courses ADD COLUMN prerequisites TEXT[];
  END IF;

  -- Add learning_objectives if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'learning_objectives') THEN
    ALTER TABLE public.courses ADD COLUMN learning_objectives TEXT[];
  END IF;

  -- Add status if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'status') THEN
    ALTER TABLE public.courses ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived'));
  END IF;

  -- Add published_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'published_at') THEN
    ALTER TABLE public.courses ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add archived_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'archived_at') THEN
    ALTER TABLE public.courses ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add original_price if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'original_price') THEN
    ALTER TABLE public.courses ADD COLUMN original_price DECIMAL(10,2);
  END IF;

  -- Add discount_percentage if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'discount_percentage') THEN
    ALTER TABLE public.courses ADD COLUMN discount_percentage INTEGER CHECK (discount_percentage >= 0 AND discount_percentage <= 100);
  END IF;

  -- Add is_free if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'is_free') THEN
    ALTER TABLE public.courses ADD COLUMN is_free BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Update existing enrollments table with missing columns
DO $$ 
BEGIN
  -- Add last_accessed_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'last_accessed_at') THEN
    ALTER TABLE public.enrollments ADD COLUMN last_accessed_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add current_lesson_id if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'current_lesson_id') THEN
    ALTER TABLE public.enrollments ADD COLUMN current_lesson_id UUID REFERENCES public.course_lessons(id);
  END IF;

  -- Add total_watch_time_minutes if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'total_watch_time_minutes') THEN
    ALTER TABLE public.enrollments ADD COLUMN total_watch_time_minutes INTEGER DEFAULT 0;
  END IF;

  -- Add certificate_issued_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'certificate_issued_at') THEN
    ALTER TABLE public.enrollments ADD COLUMN certificate_issued_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- 3. CREATE PERFORMANCE INDEXES
-- =====================================================

-- Indexes for course modules
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_order ON public.course_modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_course_modules_published ON public.course_modules(is_published);

-- Indexes for course lessons
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON public.course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_order ON public.course_lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_course_lessons_published ON public.course_lessons(is_published);

-- Indexes for course resources
CREATE INDEX IF NOT EXISTS idx_course_resources_course_id ON public.course_resources(course_id);
CREATE INDEX IF NOT EXISTS idx_course_resources_lesson_id ON public.course_resources(lesson_id);

-- Indexes for lesson progress
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_completed ON public.lesson_progress(is_completed);

-- Enhanced indexes for existing tables
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_published_at ON public.courses(published_at);
CREATE INDEX IF NOT EXISTS idx_courses_tags ON public.courses USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_enrollments_last_accessed ON public.enrollments(last_accessed_at);
CREATE INDEX IF NOT EXISTS idx_enrollments_current_lesson ON public.enrollments(current_lesson_id);

-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- 5. CREATE RLS POLICIES FOR NEW TABLES
-- =====================================================

-- Course Modules Policies
DROP POLICY IF EXISTS "Admin can manage all course modules" ON public.course_modules;
CREATE POLICY "Admin can manage all course modules" ON public.course_modules
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

DROP POLICY IF EXISTS "Users can view published course modules" ON public.course_modules;
CREATE POLICY "Users can view published course modules" ON public.course_modules
  FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Enrolled users can view course modules" ON public.course_modules;
CREATE POLICY "Enrolled users can view course modules" ON public.course_modules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments 
      WHERE enrollments.course_id = course_modules.course_id 
      AND enrollments.user_id = auth.uid()
    )
  );

-- Course Lessons Policies
DROP POLICY IF EXISTS "Admin can manage all course lessons" ON public.course_lessons;
CREATE POLICY "Admin can manage all course lessons" ON public.course_lessons
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

DROP POLICY IF EXISTS "Users can view published lessons" ON public.course_lessons;
CREATE POLICY "Users can view published lessons" ON public.course_lessons
  FOR SELECT
  USING (is_published = true OR is_free_preview = true);

DROP POLICY IF EXISTS "Enrolled users can view course lessons" ON public.course_lessons;
CREATE POLICY "Enrolled users can view course lessons" ON public.course_lessons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.course_modules cm ON cm.id = course_lessons.module_id
      WHERE e.course_id = cm.course_id 
      AND e.user_id = auth.uid()
    )
  );

-- Course Resources Policies
DROP POLICY IF EXISTS "Admin can manage all course resources" ON public.course_resources;
CREATE POLICY "Admin can manage all course resources" ON public.course_resources
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

DROP POLICY IF EXISTS "Enrolled users can view course resources" ON public.course_resources;
CREATE POLICY "Enrolled users can view course resources" ON public.course_resources
  FOR SELECT
  USING (
    (course_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.enrollments 
      WHERE enrollments.course_id = course_resources.course_id 
      AND enrollments.user_id = auth.uid()
    )) OR
    (lesson_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.course_modules cm ON cm.course_id = e.course_id
      JOIN public.course_lessons cl ON cl.module_id = cm.id
      WHERE cl.id = course_resources.lesson_id 
      AND e.user_id = auth.uid()
    ))
  );

-- Lesson Progress Policies
DROP POLICY IF EXISTS "Users can manage their own lesson progress" ON public.lesson_progress;
CREATE POLICY "Users can manage their own lesson progress" ON public.lesson_progress
  FOR ALL
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin can view all lesson progress" ON public.lesson_progress;
CREATE POLICY "Admin can view all lesson progress" ON public.lesson_progress
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

-- 6. CREATE UPDATE TRIGGERS
-- =====================================================

-- Update triggers for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
DROP TRIGGER IF EXISTS update_course_modules_updated_at ON public.course_modules;
CREATE TRIGGER update_course_modules_updated_at
  BEFORE UPDATE ON public.course_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_lessons_updated_at ON public.course_lessons;
CREATE TRIGGER update_course_lessons_updated_at
  BEFORE UPDATE ON public.course_lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. SAMPLE DATA FOR TESTING (OPTIONAL)
-- =====================================================

-- This section adds sample course modules and lessons
-- Remove this section if you don't want sample data

DO $$
DECLARE
  sample_course_id UUID;
  sample_module_id UUID;
BEGIN
  -- Check if we have any courses to add modules to
  SELECT id INTO sample_course_id FROM public.courses LIMIT 1;
  
  IF sample_course_id IS NOT NULL THEN
    -- Add a sample module
    INSERT INTO public.course_modules (id, course_id, title, description, order_index, is_published)
    VALUES (gen_random_uuid(), sample_course_id, 'Introduction', 'Getting started with the course', 0, true)
    ON CONFLICT DO NOTHING
    RETURNING id INTO sample_module_id;
    
    -- Add sample lessons if module was created
    IF sample_module_id IS NOT NULL THEN
      INSERT INTO public.course_lessons (module_id, title, description, duration_minutes, order_index, is_published, is_free_preview)
      VALUES 
        (sample_module_id, 'Welcome & Overview', 'Course introduction and what you will learn', 5, 0, true, true),
        (sample_module_id, 'Getting Started', 'Setting up your learning environment', 10, 1, true, false)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;

-- =====================================================
-- UPDATE COMPLETE
-- =====================================================

-- Verify the installation
SELECT 
  'Enhanced course structure installation complete!' as status,
  (SELECT COUNT(*) FROM public.course_modules) as modules_count,
  (SELECT COUNT(*) FROM public.course_lessons) as lessons_count,
  (SELECT COUNT(*) FROM public.course_resources) as resources_count,
  (SELECT COUNT(*) FROM public.lesson_progress) as progress_records_count;

-- Show table information
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('course_modules', 'course_lessons', 'course_resources', 'lesson_progress')
ORDER BY table_name;
