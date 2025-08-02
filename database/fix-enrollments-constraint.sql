-- Simplified fix for foreign key constraint issue
-- This updates the constraint to allow safe deletion without requiring a custom function

-- First, check if current_lesson_id column exists and add it if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'current_lesson_id') THEN
    ALTER TABLE public.enrollments ADD COLUMN current_lesson_id UUID;
  END IF;
END $$;

-- Drop existing foreign key constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'enrollments_current_lesson_id_fkey' 
    AND table_name = 'enrollments'
  ) THEN
    ALTER TABLE public.enrollments DROP CONSTRAINT enrollments_current_lesson_id_fkey;
  END IF;
END $$;

-- Add the foreign key constraint with ON DELETE SET NULL
-- This means when a lesson is deleted, the current_lesson_id will be set to NULL
-- instead of preventing the deletion
ALTER TABLE public.enrollments 
ADD CONSTRAINT enrollments_current_lesson_id_fkey 
FOREIGN KEY (current_lesson_id) 
REFERENCES public.course_lessons(id) 
ON DELETE SET NULL;
