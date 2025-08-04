-- Add missing columns to enrollments table to match TypeScript interface
-- This migration adds the missing columns that our application expects

-- Add missing columns to enrollments table
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS current_lesson_id UUID, -- No foreign key constraint yet as lessons table may not exist
ADD COLUMN IF NOT EXISTS total_watch_time_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS certificate_issued_at TIMESTAMP WITH TIME ZONE;

-- Add index for performance on new columns
CREATE INDEX IF NOT EXISTS idx_enrollments_last_accessed ON public.enrollments(last_accessed_at);
CREATE INDEX IF NOT EXISTS idx_enrollments_current_lesson ON public.enrollments(current_lesson_id);

-- Update existing records to have default values for new columns
UPDATE public.enrollments 
SET total_watch_time_minutes = 0 
WHERE total_watch_time_minutes IS NULL;

-- Add comment to document the changes
COMMENT ON TABLE public.enrollments IS 'Student enrollments with progress tracking and additional metadata for lesson tracking and certificates';
