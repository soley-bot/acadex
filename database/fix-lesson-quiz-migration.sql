-- Add missing fields to quizzes table (lesson_id already exists)
-- Only add fields that don't exist yet

-- Add course_id column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quizzes' AND column_name = 'course_id') THEN
        ALTER TABLE public.quizzes ADD COLUMN course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add passing_score column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quizzes' AND column_name = 'passing_score') THEN
        ALTER TABLE public.quizzes ADD COLUMN passing_score INTEGER DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100);
    END IF;
END $$;

-- Add max_attempts column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quizzes' AND column_name = 'max_attempts') THEN
        ALTER TABLE public.quizzes ADD COLUMN max_attempts INTEGER DEFAULT 3 CHECK (max_attempts > 0);
    END IF;
END $$;

-- Add time_limit_minutes column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quizzes' AND column_name = 'time_limit_minutes') THEN
        ALTER TABLE public.quizzes ADD COLUMN time_limit_minutes INTEGER;
    END IF;
END $$;

-- Update quiz_attempts table - add passed column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_attempts' AND column_name = 'passed') THEN
        ALTER TABLE public.quiz_attempts ADD COLUMN passed BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add percentage_score column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_attempts' AND column_name = 'percentage_score') THEN
        ALTER TABLE public.quiz_attempts ADD COLUMN percentage_score DECIMAL(5,2);
    END IF;
END $$;

-- Add attempt_number column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_attempts' AND column_name = 'attempt_number') THEN
        ALTER TABLE public.quiz_attempts ADD COLUMN attempt_number INTEGER DEFAULT 1;
    END IF;
END $$;

-- Add indexes (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON public.quizzes(lesson_id) WHERE lesson_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON public.quizzes(course_id) WHERE course_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON public.quiz_attempts(user_id, quiz_id);

-- Add constraint to ensure quiz belongs to either lesson or course (but not both)
-- Only add if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'quiz_belongs_to_lesson_or_course') THEN
        ALTER TABLE public.quizzes 
        ADD CONSTRAINT quiz_belongs_to_lesson_or_course 
        CHECK ((lesson_id IS NOT NULL AND course_id IS NULL) OR (lesson_id IS NULL AND course_id IS NOT NULL) OR (lesson_id IS NULL AND course_id IS NULL));
    END IF;
END $$;

-- Function to calculate quiz statistics
CREATE OR REPLACE FUNCTION get_quiz_stats(quiz_uuid UUID)
RETURNS TABLE (
  total_attempts BIGINT,
  average_score DECIMAL,
  pass_rate DECIMAL
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_attempts,
    ROUND(AVG(score)::DECIMAL, 2) as average_score,
    ROUND((COUNT(*) FILTER (WHERE passed = true)::DECIMAL / COUNT(*) * 100), 2) as pass_rate
  FROM quiz_attempts 
  WHERE quiz_id = quiz_uuid;
END;
$$;

-- Function to get user's quiz attempts for a specific quiz
CREATE OR REPLACE FUNCTION get_user_quiz_attempts(user_uuid UUID, quiz_uuid UUID)
RETURNS TABLE (
  attempt_number INTEGER,
  score INTEGER,
  percentage_score DECIMAL,
  passed BOOLEAN,
  completed_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qa.attempt_number,
    qa.score,
    qa.percentage_score,
    qa.passed,
    qa.completed_at
  FROM quiz_attempts qa
  WHERE qa.user_id = user_uuid AND qa.quiz_id = quiz_uuid
  ORDER BY qa.attempt_number DESC;
END;
$$;

-- Update existing RLS policies for lesson quiz access
-- First drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view lesson quizzes from enrolled courses" ON public.quizzes;
DROP POLICY IF EXISTS "Users can view course quizzes from enrolled courses" ON public.quizzes;

-- Create new policies for lesson and course quiz access
CREATE POLICY "Users can view lesson quizzes from enrolled courses" ON public.quizzes
  FOR SELECT USING (
    lesson_id IS NOT NULL AND lesson_id IN (
      SELECT cl.id 
      FROM course_lessons cl
      JOIN course_modules cm ON cl.module_id = cm.id
      JOIN enrollments e ON cm.course_id = e.course_id
      WHERE e.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view course quizzes from enrolled courses" ON public.quizzes
  FOR SELECT USING (
    course_id IS NOT NULL AND course_id IN (
      SELECT course_id 
      FROM enrollments 
      WHERE user_id = auth.uid()
    )
  );

-- Comments for documentation
COMMENT ON COLUMN public.quizzes.lesson_id IS 'Optional foreign key to course_lessons - for lesson-specific quizzes';
COMMENT ON COLUMN public.quizzes.course_id IS 'Optional foreign key to courses - for course-level quizzes';
COMMENT ON COLUMN public.quizzes.passing_score IS 'Minimum percentage score required to pass the quiz';
COMMENT ON COLUMN public.quizzes.max_attempts IS 'Maximum number of attempts allowed for this quiz';
COMMENT ON COLUMN public.quizzes.time_limit_minutes IS 'Time limit for completing the quiz in minutes (NULL = no limit)';

-- Success message
SELECT 'Quiz lesson integration migration completed successfully!' as result;
