-- =====================================================
-- ACADEX DATABASE FIX - MISSING CARD FIELDS
-- =====================================================
-- This script adds missing fields that the UI cards expect
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. ADD MISSING COURSE FIELDS
-- =====================================================

-- Add instructor_name field to courses table for denormalization (performance)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'courses' AND column_name = 'instructor_name') THEN
        ALTER TABLE public.courses ADD COLUMN instructor_name TEXT;
    END IF;
END $$;

-- Add rating field to courses table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'courses' AND column_name = 'rating') THEN
        ALTER TABLE public.courses ADD COLUMN rating DECIMAL(2,1) DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5);
    END IF;
END $$;

-- Add student_count field to courses table  
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'courses' AND column_name = 'student_count') THEN
        ALTER TABLE public.courses ADD COLUMN student_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Update instructor_name for existing courses
UPDATE public.courses 
SET instructor_name = users.name 
FROM public.users 
WHERE courses.instructor_id = users.id 
AND courses.instructor_name IS NULL;

-- Update student_count for existing courses
UPDATE public.courses 
SET student_count = (
    SELECT COUNT(*) 
    FROM public.enrollments 
    WHERE enrollments.course_id = courses.id
)
WHERE student_count = 0;

-- 2. ADD COMPUTED FIELDS FOR QUIZZES
-- =====================================================

-- Add attempts_count field to quizzes table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'quizzes' AND column_name = 'attempts_count') THEN
        ALTER TABLE public.quizzes ADD COLUMN attempts_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add average_score field to quizzes table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'quizzes' AND column_name = 'average_score') THEN
        ALTER TABLE public.quizzes ADD COLUMN average_score DECIMAL(5,2) DEFAULT 0;
    END IF;
END $$;

-- Update quiz statistics for existing quizzes
UPDATE public.quizzes 
SET attempts_count = (
    SELECT COUNT(*) 
    FROM public.quiz_attempts 
    WHERE quiz_attempts.quiz_id = quizzes.id
),
average_score = (
    SELECT COALESCE(AVG(score), 0)
    FROM public.quiz_attempts 
    WHERE quiz_attempts.quiz_id = quizzes.id
)
WHERE attempts_count = 0;

-- 3. CREATE FUNCTIONS TO MAINTAIN COUNTS
-- =====================================================

-- Function to update course student count
CREATE OR REPLACE FUNCTION update_course_student_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.courses 
        SET student_count = student_count + 1 
        WHERE id = NEW.course_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.courses 
        SET student_count = student_count - 1 
        WHERE id = OLD.course_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update quiz attempt statistics
CREATE OR REPLACE FUNCTION update_quiz_statistics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.quizzes 
        SET attempts_count = attempts_count + 1,
            average_score = (
                SELECT AVG(score) 
                FROM public.quiz_attempts 
                WHERE quiz_id = NEW.quiz_id
            )
        WHERE id = NEW.quiz_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.quizzes 
        SET attempts_count = attempts_count - 1,
            average_score = (
                SELECT COALESCE(AVG(score), 0)
                FROM public.quiz_attempts 
                WHERE quiz_id = OLD.quiz_id
            )
        WHERE id = OLD.quiz_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. CREATE TRIGGERS
-- =====================================================

-- Trigger for course enrollment count
DROP TRIGGER IF EXISTS trigger_update_course_student_count ON public.enrollments;
CREATE TRIGGER trigger_update_course_student_count
    AFTER INSERT OR DELETE ON public.enrollments
    FOR EACH ROW EXECUTE FUNCTION update_course_student_count();

-- Trigger for quiz attempt statistics
DROP TRIGGER IF EXISTS trigger_update_quiz_statistics ON public.quiz_attempts;
CREATE TRIGGER trigger_update_quiz_statistics
    AFTER INSERT OR DELETE ON public.quiz_attempts
    FOR EACH ROW EXECUTE FUNCTION update_quiz_statistics();

-- 5. UPDATE COURSE FIELDS IN DATABASE_TYPES
-- =====================================================
-- Note: The COURSE_FIELDS constant in src/lib/database-types.ts should be updated to include:
-- 'instructor_name', 'rating', 'student_count'

-- 6. UPDATE QUIZ FIELDS IN DATABASE_TYPES  
-- =====================================================
-- Note: The QUIZ_FIELDS constant in src/lib/database-types.ts should be updated to include:
-- 'attempts_count', 'average_score'

COMMIT;
