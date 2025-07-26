-- CHUNK 3: Indexes and Constraints
-- Run this after tables are created

-- Add foreign key constraints (without auth.users dependency)
ALTER TABLE public.courses 
ADD CONSTRAINT fk_courses_instructor 
FOREIGN KEY (instructor_id) REFERENCES public.users(id);

ALTER TABLE public.quizzes 
ADD CONSTRAINT fk_quizzes_course 
FOREIGN KEY (course_id) REFERENCES public.courses(id);

ALTER TABLE public.questions 
ADD CONSTRAINT fk_questions_quiz 
FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;

ALTER TABLE public.enrollments 
ADD CONSTRAINT fk_enrollments_user 
FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE public.enrollments 
ADD CONSTRAINT fk_enrollments_course 
FOREIGN KEY (course_id) REFERENCES public.courses(id);

ALTER TABLE public.quiz_attempts 
ADD CONSTRAINT fk_quiz_attempts_user 
FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE public.quiz_attempts 
ADD CONSTRAINT fk_quiz_attempts_quiz 
FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON public.courses(is_active);
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON public.quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty ON public.quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON public.questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);

-- Verify constraints were added
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;
