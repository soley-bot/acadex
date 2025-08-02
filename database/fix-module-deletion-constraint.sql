-- Fix foreign key constraint for enrollments.current_lesson_id
-- This allows safe deletion of course modules and lessons while maintaining data integrity

-- First, check if the constraint exists and drop it
DO $$ 
BEGIN
  -- Drop the existing foreign key constraint if it exists
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

-- Create a function to handle module deletion safely
CREATE OR REPLACE FUNCTION safe_delete_course_module(module_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  lesson_ids UUID[];
BEGIN
  -- Get all lesson IDs in this module
  SELECT array_agg(id) INTO lesson_ids
  FROM public.course_lessons
  WHERE module_id = module_id_param;
  
  -- Update enrollments to clear current_lesson_id if it points to lessons in this module
  UPDATE public.enrollments
  SET current_lesson_id = NULL
  WHERE current_lesson_id = ANY(lesson_ids);
  
  -- Now safely delete the module (lessons will be cascade deleted)
  DELETE FROM public.course_modules WHERE id = module_id_param;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and return false
    RAISE NOTICE 'Error deleting module %: %', module_id_param, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION safe_delete_course_module(UUID) TO authenticated;
