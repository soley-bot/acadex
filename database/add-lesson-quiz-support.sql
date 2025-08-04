-- Add lesson_id support to quizzes table for lesson-specific quizzes
-- This allows linking quizzes directly to lessons for lesson quiz integration

-- Add lesson_id column to quizzes table
ALTER TABLE public.quizzes 
ADD COLUMN lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE;

-- Add course_id column to quizzes table (for course-level quizzes)
ALTER TABLE public.quizzes 
ADD COLUMN course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE;

-- Add additional quiz configuration fields
ALTER TABLE public.quizzes 
ADD COLUMN passing_score INTEGER DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100);

ALTER TABLE public.quizzes 
ADD COLUMN max_attempts INTEGER DEFAULT 3 CHECK (max_attempts > 0);

ALTER TABLE public.quizzes 
ADD COLUMN time_limit_minutes INTEGER;

-- Update quiz_attempts table to add more fields
ALTER TABLE public.quiz_attempts 
ADD COLUMN passed BOOLEAN DEFAULT false;

ALTER TABLE public.quiz_attempts 
ADD COLUMN percentage_score DECIMAL(5,2);

ALTER TABLE public.quiz_attempts 
ADD COLUMN attempt_number INTEGER DEFAULT 1;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON public.quizzes(lesson_id) WHERE lesson_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON public.quizzes(course_id) WHERE course_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON public.quiz_attempts(user_id, quiz_id);

-- Add constraint to ensure quiz belongs to either lesson or course (but not both)
ALTER TABLE public.quizzes 
ADD CONSTRAINT quiz_belongs_to_lesson_or_course 
CHECK ((lesson_id IS NOT NULL AND course_id IS NULL) OR (lesson_id IS NULL AND course_id IS NOT NULL) OR (lesson_id IS NULL AND course_id IS NULL));

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

-- Update RLS policies for new fields
-- Allow users to read quizzes associated with their enrolled courses
CREATE POLICY "Users can view lesson quizzes from enrolled courses" ON public.quizzes
  FOR SELECT USING (
    lesson_id IN (
      SELECT cl.id 
      FROM course_lessons cl
      JOIN course_modules cm ON cl.module_id = cm.id
      JOIN enrollments e ON cm.course_id = e.course_id
      WHERE e.user_id = auth.uid()
    )
  );

-- Allow users to view course quizzes from enrolled courses  
CREATE POLICY "Users can view course quizzes from enrolled courses" ON public.quizzes
  FOR SELECT USING (
    course_id IN (
      SELECT course_id 
      FROM enrollments 
      WHERE user_id = auth.uid()
    )
  );

-- Comment explaining the new structure
COMMENT ON COLUMN public.quizzes.lesson_id IS 'Optional foreign key to course_lessons - for lesson-specific quizzes';
COMMENT ON COLUMN public.quizzes.course_id IS 'Optional foreign key to courses - for course-level quizzes';
COMMENT ON COLUMN public.quizzes.passing_score IS 'Minimum percentage score required to pass the quiz';
COMMENT ON COLUMN public.quizzes.max_attempts IS 'Maximum number of attempts allowed for this quiz';
COMMENT ON COLUMN public.quizzes.time_limit_minutes IS 'Time limit for completing the quiz in minutes (NULL = no limit)';
