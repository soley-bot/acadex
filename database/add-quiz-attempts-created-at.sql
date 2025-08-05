-- Add created_at column to quiz_attempts table
-- This column is needed for quiz analytics functionality

-- Add the created_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'quiz_attempts' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.quiz_attempts 
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    
    -- Update existing records to use completed_at as created_at if they exist
    UPDATE public.quiz_attempts 
    SET created_at = completed_at 
    WHERE created_at IS NULL AND completed_at IS NOT NULL;
    
    -- Set created_at to now for records without completed_at
    UPDATE public.quiz_attempts 
    SET created_at = NOW() 
    WHERE created_at IS NULL;
    
    RAISE NOTICE 'Successfully added created_at column to quiz_attempts table';
  ELSE
    RAISE NOTICE 'created_at column already exists in quiz_attempts table';
  END IF;
END $$;

-- Add an index for better performance on analytics queries
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created_at 
ON public.quiz_attempts (created_at);

-- Add index for user-specific analytics
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_created_at 
ON public.quiz_attempts (user_id, created_at);

-- Add index for quiz-specific analytics  
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_created_at 
ON public.quiz_attempts (quiz_id, created_at);

COMMENT ON COLUMN public.quiz_attempts.created_at IS 'Timestamp when the quiz attempt was started/created';
