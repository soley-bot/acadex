-- =====================================================
-- ACADEX DATABASE SCHEMA V2.0
-- Complete database setup with quiz system enhancements
-- =====================================================

-- This file contains the complete, consolidated database schema
-- including all fixes, enhancements, and the updated quiz creation system

-- WARNING: This will create/modify tables. Backup your data first!

-- =====================================================
-- 1. EXTENSIONS & SETUP
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 2. CUSTOM TYPES
-- =====================================================

-- Badge rarity levels
DO $$ BEGIN
    CREATE TYPE badge_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Media roles for question attachments
DO $$ BEGIN
    CREATE TYPE media_role AS ENUM ('question', 'option', 'feedback', 'explanation');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Permission levels for quiz access
DO $$ BEGIN
    CREATE TYPE permission_level AS ENUM ('view', 'attempt', 'edit', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 3. CORE TABLES
-- =====================================================

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id uuid NOT NULL,
    email text NOT NULL UNIQUE,
    name text NOT NULL,
    avatar_url text,
    role text DEFAULT 'student'::text CHECK (role = ANY (ARRAY['student'::text, 'instructor'::text, 'admin'::text])),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Categories for courses and quizzes
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying NOT NULL UNIQUE,
    description text,
    color character varying DEFAULT '#6366f1'::character varying,
    icon character varying,
    type character varying DEFAULT 'general'::character varying CHECK (type::text = ANY (ARRAY['general'::character varying, 'quiz'::character varying, 'course'::character varying]::text[])),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    CONSTRAINT categories_pkey PRIMARY KEY (id),
    CONSTRAINT categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- =====================================================
-- 4. COURSE SYSTEM
-- =====================================================

-- Main courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL,
    instructor_id uuid NOT NULL,
    instructor_name text NOT NULL,
    category text NOT NULL,
    level text DEFAULT 'beginner'::text CHECK (level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])),
    price numeric NOT NULL DEFAULT 0,
    duration text NOT NULL,
    image_url text,
    rating numeric DEFAULT 0 CHECK (rating >= 0::numeric AND rating <= 5::numeric),
    student_count integer DEFAULT 0,
    is_published boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    thumbnail_url text,
    video_preview_url text,
    tags text[] DEFAULT '{}',
    prerequisites text[] DEFAULT '{}',
    learning_objectives text[] DEFAULT '{}',
    status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'review'::text, 'published'::text, 'archived'::text])),
    published_at timestamp with time zone,
    archived_at timestamp with time zone,
    original_price numeric DEFAULT 0,
    discount_percentage integer DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    is_free boolean DEFAULT false,
    learning_outcomes text[] DEFAULT '{}',
    certificate_enabled boolean DEFAULT false,
    estimated_completion_time character varying,
    difficulty_rating integer DEFAULT 1 CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    CONSTRAINT courses_pkey PRIMARY KEY (id),
    CONSTRAINT courses_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.users(id)
);

-- Course modules
CREATE TABLE IF NOT EXISTS public.course_modules (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    order_index integer NOT NULL,
    is_published boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT course_modules_pkey PRIMARY KEY (id),
    CONSTRAINT course_modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);

-- Course lessons  
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    module_id uuid NOT NULL,
    course_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    content text,
    video_url text,
    duration_minutes integer DEFAULT 0,
    order_index integer NOT NULL,
    is_published boolean DEFAULT false,
    is_free_preview boolean DEFAULT false,
    quiz_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT course_lessons_pkey PRIMARY KEY (id),
    CONSTRAINT course_lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.course_modules(id),
    CONSTRAINT course_lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);

-- Course resources
CREATE TABLE IF NOT EXISTS public.course_resources (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    course_id uuid,
    lesson_id uuid,
    title text NOT NULL,
    description text,
    file_url text NOT NULL,
    file_type text NOT NULL,
    file_size_bytes bigint,
    is_downloadable boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT course_resources_pkey PRIMARY KEY (id),
    CONSTRAINT course_resources_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
    CONSTRAINT course_resources_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.course_lessons(id)
);

-- Enrollments
CREATE TABLE IF NOT EXISTS public.enrollments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed_at timestamp with time zone,
    enrolled_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone,
    current_lesson_id uuid,
    total_watch_time_minutes integer DEFAULT 0,
    certificate_issued_at timestamp with time zone,
    CONSTRAINT enrollments_pkey PRIMARY KEY (id),
    CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
    CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
    CONSTRAINT enrollments_current_lesson_id_fkey FOREIGN KEY (current_lesson_id) REFERENCES public.course_lessons(id)
);

-- Lesson progress tracking
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    is_completed boolean DEFAULT false,
    watch_time_minutes integer DEFAULT 0,
    last_position_seconds integer DEFAULT 0,
    completed_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT lesson_progress_pkey PRIMARY KEY (id),
    CONSTRAINT lesson_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
    CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.course_lessons(id)
);

-- =====================================================
-- 5. ENHANCED QUIZ SYSTEM
-- =====================================================

-- Quiz categories
CREATE TABLE IF NOT EXISTS public.quiz_categories (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying NOT NULL UNIQUE,
    description text,
    color character varying DEFAULT '#3B82F6'::character varying,
    icon character varying,
    parent_id uuid,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT quiz_categories_pkey PRIMARY KEY (id),
    CONSTRAINT quiz_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.quiz_categories(id)
);

-- Main quizzes table with enhanced features
CREATE TABLE IF NOT EXISTS public.quizzes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    difficulty text DEFAULT 'beginner'::text CHECK (difficulty = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])),
    duration_minutes integer NOT NULL DEFAULT 10,
    total_questions integer DEFAULT 0,
    is_published boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Course integration
    course_id uuid,
    lesson_id uuid,
    
    -- Quiz settings
    passing_score integer DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
    max_attempts integer DEFAULT 0,
    time_limit_minutes integer,
    image_url text,
    
    -- Display options
    shuffle_questions boolean DEFAULT false,
    shuffle_options boolean DEFAULT false,
    show_results_immediately boolean DEFAULT true,
    allow_review boolean DEFAULT true,
    allow_backtrack boolean DEFAULT true,
    randomize_questions boolean DEFAULT false,
    questions_per_page integer DEFAULT 1,
    show_progress boolean DEFAULT true,
    auto_submit boolean DEFAULT false,
    
    -- Additional settings
    instructions text,
    tags text[] DEFAULT '{}',
    estimated_time_minutes integer,
    
    -- Advanced features
    retake_policy jsonb DEFAULT '{"allowed": true, "max_attempts": 0, "cooldown_hours": 0}'::jsonb,
    grading_policy jsonb DEFAULT '{"method": "highest", "partial_credit": false, "show_correct_answers": true}'::jsonb,
    availability_window jsonb DEFAULT '{"start_date": null, "end_date": null, "timezone": "UTC"}'::jsonb,
    proctoring_settings jsonb DEFAULT '{"enabled": false, "webcam": false, "screen_lock": false, "time_warnings": [300, 60]}'::jsonb,
    
    -- Analytics
    certificate_template_id uuid,
    analytics_enabled boolean DEFAULT true,
    public_results boolean DEFAULT false,
    allow_anonymous boolean DEFAULT false,
    attempts_count integer DEFAULT 0,
    average_score numeric DEFAULT 0,
    
    CONSTRAINT quizzes_pkey PRIMARY KEY (id),
    CONSTRAINT quizzes_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
    CONSTRAINT quizzes_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.course_lessons(id)
);

-- Enhanced quiz questions with multi-format answer support
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    quiz_id uuid NOT NULL,
    question text NOT NULL,
    options jsonb NOT NULL,
    
    -- THREE-FIELD ANSWER SYSTEM (supports all question types)
    correct_answer integer NOT NULL,              -- For multiple_choice, true_false (option indexes)
    correct_answer_text text,                     -- For fill_blank, essay (text answers)
    correct_answer_json jsonb,                    -- For matching, ordering (complex answers)
    
    explanation text,
    order_index integer NOT NULL,
    points integer DEFAULT 1,
    difficulty_level text DEFAULT 'medium'::text CHECK (difficulty_level = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text])),
    
    -- Media support
    image_url text,
    audio_url text,
    video_url text,
    
    -- Question type with full support
    question_type text DEFAULT 'multiple_choice'::text CHECK (question_type = ANY (ARRAY[
        'multiple_choice'::text, 
        'single_choice'::text, 
        'true_false'::text, 
        'fill_blank'::text, 
        'essay'::text, 
        'matching'::text, 
        'ordering'::text
    ])),
    
    -- Advanced features
    tags text[] DEFAULT '{}',
    time_limit_seconds integer,
    required boolean DEFAULT true,
    randomize_options boolean DEFAULT false,
    partial_credit boolean DEFAULT false,
    
    -- Feedback system
    feedback_correct text,
    feedback_incorrect text,
    hint text,
    
    -- Metadata and advanced features
    question_metadata jsonb DEFAULT '{}'::jsonb,
    conditional_logic jsonb,
    weight numeric DEFAULT 1.0,
    auto_grade boolean DEFAULT true,
    rubric jsonb,
    
    CONSTRAINT quiz_questions_pkey PRIMARY KEY (id),
    CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id)
);

-- Quiz attempts with enhanced tracking
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    quiz_id uuid NOT NULL,
    score integer NOT NULL DEFAULT 0,
    total_questions integer NOT NULL,
    time_taken_seconds integer NOT NULL DEFAULT 0,
    answers jsonb NOT NULL,
    completed_at timestamp with time zone DEFAULT now(),
    passed boolean DEFAULT false,
    percentage_score numeric,
    attempt_number integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id),
    CONSTRAINT quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
    CONSTRAINT quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id)
);

-- =====================================================
-- 6. MEDIA & STORAGE
-- =====================================================

-- Media library for file management
CREATE TABLE IF NOT EXISTS public.media_library (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    filename character varying NOT NULL,
    original_name character varying,
    file_path character varying NOT NULL,
    file_type character varying,
    file_size integer,
    mime_type character varying,
    alt_text character varying,
    tags text[] DEFAULT '{}',
    is_public boolean DEFAULT false,
    folder_path character varying DEFAULT ''::character varying,
    thumbnail_url character varying,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT media_library_pkey PRIMARY KEY (id),
    CONSTRAINT media_library_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- =====================================================
-- 7. PERFORMANCE INDEXES
-- =====================================================

-- Course system indexes
CREATE INDEX IF NOT EXISTS idx_courses_instructor_published ON public.courses(instructor_id, is_published);
CREATE INDEX IF NOT EXISTS idx_courses_category_published ON public.courses(category, is_published);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON public.enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON public.lesson_progress(user_id, lesson_id);

-- Quiz system indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_published ON public.quizzes(is_published);
CREATE INDEX IF NOT EXISTS idx_quizzes_category ON public.quizzes(category);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_order ON public.quiz_questions(quiz_id, order_index);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON public.quiz_attempts(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed ON public.quiz_attempts(completed_at);

-- Performance indexes for analytics
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_score ON public.quiz_attempts(score);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_type ON public.quiz_questions(question_type);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON public.quiz_questions(difficulty_level);

-- =====================================================
-- 8. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update quiz question count
CREATE OR REPLACE FUNCTION update_quiz_question_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.quizzes 
        SET total_questions = (
            SELECT COUNT(*) FROM public.quiz_questions 
            WHERE quiz_id = NEW.quiz_id
        )
        WHERE id = NEW.quiz_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.quizzes 
        SET total_questions = (
            SELECT COUNT(*) FROM public.quiz_questions 
            WHERE quiz_id = OLD.quiz_id
        )
        WHERE id = OLD.quiz_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for quiz question count
DROP TRIGGER IF EXISTS trigger_update_quiz_question_count ON public.quiz_questions;
CREATE TRIGGER trigger_update_quiz_question_count
    AFTER INSERT OR DELETE ON public.quiz_questions
    FOR EACH ROW EXECUTE FUNCTION update_quiz_question_count();

-- Function to update course student count
CREATE OR REPLACE FUNCTION update_course_student_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.courses 
        SET student_count = (
            SELECT COUNT(*) FROM public.enrollments 
            WHERE course_id = NEW.course_id
        )
        WHERE id = NEW.course_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.courses 
        SET student_count = (
            SELECT COUNT(*) FROM public.enrollments 
            WHERE course_id = OLD.course_id
        )
        WHERE id = OLD.course_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for course student count
DROP TRIGGER IF EXISTS trigger_update_course_student_count ON public.enrollments;
CREATE TRIGGER trigger_update_course_student_count
    AFTER INSERT OR DELETE ON public.enrollments
    FOR EACH ROW EXECUTE FUNCTION update_course_student_count();

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Admin function for role checking
CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_uuid AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
CREATE POLICY "Admins can manage all users" ON public.users FOR ALL USING (is_admin());

-- Course policies
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
CREATE POLICY "Anyone can view published courses" ON public.courses FOR SELECT USING (is_published = true OR auth.uid() = instructor_id OR is_admin());

DROP POLICY IF EXISTS "Instructors can manage their courses" ON public.courses;
CREATE POLICY "Instructors can manage their courses" ON public.courses FOR ALL USING (auth.uid() = instructor_id OR is_admin());

-- Quiz policies
DROP POLICY IF EXISTS "Anyone can view published quizzes" ON public.quizzes;
CREATE POLICY "Anyone can view published quizzes" ON public.quizzes FOR SELECT USING (is_published = true OR is_admin());

DROP POLICY IF EXISTS "Admins can manage all quizzes" ON public.quizzes;
CREATE POLICY "Admins can manage all quizzes" ON public.quizzes FOR ALL USING (is_admin());

-- Quiz questions policies
DROP POLICY IF EXISTS "Users can view questions for published quizzes" ON public.quiz_questions;
CREATE POLICY "Users can view questions for published quizzes" ON public.quiz_questions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.quizzes WHERE id = quiz_id AND is_published = true) OR is_admin()
);

DROP POLICY IF EXISTS "Admins can manage all quiz questions" ON public.quiz_questions;
CREATE POLICY "Admins can manage all quiz questions" ON public.quiz_questions FOR ALL USING (is_admin());

-- Quiz attempts policies
DROP POLICY IF EXISTS "Users can view own attempts" ON public.quiz_attempts;
CREATE POLICY "Users can view own attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Users can create own attempts" ON public.quiz_attempts;
CREATE POLICY "Users can create own attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all attempts" ON public.quiz_attempts;
CREATE POLICY "Admins can view all attempts" ON public.quiz_attempts FOR ALL USING (is_admin());

-- =====================================================
-- 10. STORAGE BUCKETS & POLICIES
-- =====================================================

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('course-images', 'course-images', true),
    ('quiz-images', 'quiz-images', true),
    ('user-avatars', 'user-avatars', true),
    ('lesson-resources', 'lesson-resources', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for course images
CREATE POLICY "Anyone can view course images" ON storage.objects FOR SELECT USING (bucket_id = 'course-images');
CREATE POLICY "Authenticated users can upload course images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'course-images' AND auth.role() = 'authenticated');

-- Storage policies for quiz images  
CREATE POLICY "Anyone can view quiz images" ON storage.objects FOR SELECT USING (bucket_id = 'quiz-images');
CREATE POLICY "Authenticated users can upload quiz images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'quiz-images' AND auth.role() = 'authenticated');

-- =====================================================
-- 11. SAMPLE DATA (Optional)
-- =====================================================

-- Insert sample categories
INSERT INTO public.categories (name, description, color, icon, type) VALUES
    ('English Grammar', 'Essential grammar rules and exercises', '#3B82F6', 'BookOpen', 'quiz'),
    ('Vocabulary', 'Word learning and usage', '#10B981', 'Book', 'quiz'),
    ('Speaking Practice', 'Conversation and pronunciation', '#F59E0B', 'Mic', 'quiz'),
    ('Reading Comprehension', 'Text understanding and analysis', '#8B5CF6', 'FileText', 'quiz')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Verify the setup
SELECT 'Database schema setup completed successfully!' as status;

-- Show table counts
SELECT 
    'Tables created:' as info,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 'courses', 'course_modules', 'course_lessons', 
    'quizzes', 'quiz_questions', 'quiz_attempts', 'enrollments'
);
