-- =====================================================
-- ACADEX DATABASE SCHEMA V3.0 - CURRENT IMPLEMENTATION
-- Complete database schema matching the actual current database
-- Generated: September 19, 2025
-- =====================================================

-- This file contains the complete, actual database schema
-- that matches your current production database structure
-- including all advanced features and enhancements

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
-- 3. CORE SYSTEM TABLES
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

-- Subjects for organizational hierarchy
CREATE TABLE IF NOT EXISTS public.subjects (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying NOT NULL,
    slug character varying NOT NULL UNIQUE,
    description text,
    icon character varying,
    color character varying DEFAULT '#6366f1'::character varying,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subjects_pkey PRIMARY KEY (id)
);

-- Enhanced categories with hierarchical support
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    subject_id uuid,
    parent_id uuid,
    name character varying NOT NULL,
    slug character varying NOT NULL,
    description text,
    color character varying DEFAULT '#6366f1'::character varying,
    icon character varying,
    level integer DEFAULT 1,
    sort_order integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    CONSTRAINT categories_pkey PRIMARY KEY (id),
    CONSTRAINT categories_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
    CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id),
    CONSTRAINT categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- Content categorization system
CREATE TABLE IF NOT EXISTS public.content_categories (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    content_id uuid NOT NULL,
    category_id uuid,
    content_type character varying NOT NULL CHECK (content_type::text = ANY (ARRAY['course'::character varying, 'quiz'::character varying, 'lesson'::character varying, 'article'::character varying, 'video'::character varying, 'podcast'::character varying]::text[])),
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT content_categories_pkey PRIMARY KEY (id),
    CONSTRAINT content_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);

-- =====================================================
-- 4. MEDIA & STORAGE SYSTEM
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
-- 5. COURSE SYSTEM
-- =====================================================

-- Main courses table with full e-commerce support
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

-- Course lessons with enhanced features
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    module_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    content text,
    video_url text,
    duration_minutes integer DEFAULT 0,
    order_index integer NOT NULL,
    is_published boolean DEFAULT false,
    is_free_preview boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    duration character varying,
    is_preview boolean DEFAULT false,
    course_id uuid NOT NULL,
    quiz_id uuid,
    CONSTRAINT course_lessons_pkey PRIMARY KEY (id),
    CONSTRAINT course_lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
    CONSTRAINT course_lessons_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id),
    CONSTRAINT course_lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.course_modules(id)
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

-- Course reviews
CREATE TABLE IF NOT EXISTS public.course_reviews (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text text,
    is_verified_purchase boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT course_reviews_pkey PRIMARY KEY (id),
    CONSTRAINT course_reviews_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
    CONSTRAINT course_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Enrollments with enhanced tracking
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
    CONSTRAINT enrollments_current_lesson_id_fkey FOREIGN KEY (current_lesson_id) REFERENCES public.course_lessons(id),
    CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
    CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
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
-- 6. ENHANCED QUIZ SYSTEM
-- =====================================================

-- Main quizzes table with all advanced features
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
    course_id uuid,
    lesson_id uuid,
    passing_score integer DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
    max_attempts integer DEFAULT 0,
    time_limit_minutes integer,
    image_url text,
    shuffle_questions boolean DEFAULT false,
    shuffle_options boolean DEFAULT false,
    show_results_immediately boolean DEFAULT true,
    allow_review boolean DEFAULT true,
    allow_backtrack boolean DEFAULT true,
    randomize_questions boolean DEFAULT false,
    questions_per_page integer DEFAULT 1,
    show_progress boolean DEFAULT true,
    auto_submit boolean DEFAULT false,
    instructions text,
    tags text[] DEFAULT '{}',
    estimated_time_minutes integer,
    retake_policy jsonb DEFAULT '{"allowed": true, "max_attempts": 0, "cooldown_hours": 0}'::jsonb,
    grading_policy jsonb DEFAULT '{"method": "highest", "partial_credit": false, "show_correct_answers": true}'::jsonb,
    availability_window jsonb DEFAULT '{"end_date": null, "timezone": "UTC", "start_date": null}'::jsonb,
    proctoring_settings jsonb DEFAULT '{"webcam": false, "enabled": false, "screen_lock": false, "time_warnings": [300, 60]}'::jsonb,
    certificate_template_id uuid,
    analytics_enabled boolean DEFAULT true,
    public_results boolean DEFAULT false,
    allow_anonymous boolean DEFAULT false,
    attempts_count integer DEFAULT 0,
    average_score numeric DEFAULT 0,
    -- READING QUIZ SUPPORT
    reading_passage text,
    passage_title character varying,
    passage_source character varying,
    passage_audio_url text,
    word_count integer,
    estimated_read_time integer,
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
    image_url text,
    audio_url text,
    video_url text,
    question_type text DEFAULT 'multiple_choice'::text CHECK (question_type = ANY (ARRAY['multiple_choice'::text, 'single_choice'::text, 'true_false'::text, 'fill_blank'::text, 'essay'::text, 'matching'::text, 'ordering'::text])),
    tags text[] DEFAULT '{}',
    time_limit_seconds integer,
    required boolean DEFAULT true,
    randomize_options boolean DEFAULT false,
    partial_credit boolean DEFAULT false,
    feedback_correct text,
    feedback_incorrect text,
    hint text,
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
-- 7. ADVANCED QUIZ FEATURES
-- =====================================================

-- Adaptive quiz settings for personalized learning
CREATE TABLE IF NOT EXISTS public.adaptive_quiz_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    quiz_id uuid UNIQUE,
    enabled boolean DEFAULT false,
    difficulty_adjustment boolean DEFAULT true,
    min_questions integer DEFAULT 5,
    max_questions integer DEFAULT 20,
    target_accuracy numeric DEFAULT 0.7,
    stopping_criteria jsonb DEFAULT '{"confidence": 0.95, "standard_error": 0.3}'::jsonb,
    item_selection_algorithm character varying DEFAULT 'maximum_information'::character varying,
    theta_estimation_method character varying DEFAULT 'maximum_likelihood'::character varying,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT adaptive_quiz_settings_pkey PRIMARY KEY (id),
    CONSTRAINT adaptive_quiz_settings_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id)
);

-- Question analytics for performance tracking
CREATE TABLE IF NOT EXISTS public.question_analytics (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    question_id uuid UNIQUE,
    total_attempts integer DEFAULT 0,
    correct_attempts integer DEFAULT 0,
    average_time_seconds numeric DEFAULT 0,
    difficulty_rating numeric DEFAULT 0,
    discrimination_index numeric DEFAULT 0,
    last_updated timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT question_analytics_pkey PRIMARY KEY (id),
    CONSTRAINT question_analytics_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.quiz_questions(id)
);

-- Detailed question attempts tracking
CREATE TABLE IF NOT EXISTS public.question_attempts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    quiz_attempt_id uuid,
    question_id uuid,
    user_answer jsonb,
    is_correct boolean,
    points_earned numeric DEFAULT 0,
    points_possible numeric DEFAULT 1,
    time_spent_seconds integer DEFAULT 0,
    attempts_count integer DEFAULT 1,
    flagged boolean DEFAULT false,
    confidence_level integer CHECK (confidence_level >= 1 AND confidence_level <= 5),
    feedback_shown boolean DEFAULT false,
    hint_used boolean DEFAULT false,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT question_attempts_pkey PRIMARY KEY (id),
    CONSTRAINT question_attempts_quiz_attempt_id_fkey FOREIGN KEY (quiz_attempt_id) REFERENCES public.quiz_attempts(id),
    CONSTRAINT question_attempts_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.quiz_questions(id)
);

-- Question media attachments
CREATE TABLE IF NOT EXISTS public.question_media (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    question_id uuid,
    media_id uuid,
    media_role media_role DEFAULT 'question'::media_role,
    display_order integer DEFAULT 0,
    is_required boolean DEFAULT false,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT question_media_pkey PRIMARY KEY (id),
    CONSTRAINT question_media_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.quiz_questions(id),
    CONSTRAINT question_media_media_id_fkey FOREIGN KEY (media_id) REFERENCES public.media_library(id)
);

-- Quiz session tracking
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    quiz_attempt_id uuid,
    user_id uuid,
    quiz_id uuid,
    session_data jsonb DEFAULT '{}'::jsonb,
    started_at timestamp with time zone DEFAULT now(),
    last_activity_at timestamp with time zone DEFAULT now(),
    ended_at timestamp with time zone,
    is_active boolean DEFAULT true,
    user_agent text,
    ip_address inet,
    browser_info jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT quiz_sessions_pkey PRIMARY KEY (id),
    CONSTRAINT quiz_sessions_quiz_attempt_id_fkey FOREIGN KEY (quiz_attempt_id) REFERENCES public.quiz_attempts(id),
    CONSTRAINT quiz_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT quiz_sessions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id)
);

-- Quiz feedback system
CREATE TABLE IF NOT EXISTS public.quiz_feedback (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    quiz_id uuid,
    user_id uuid,
    rating integer CHECK (rating >= 1 AND rating <= 5),
    comment text,
    is_public boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    helpful_count integer DEFAULT 0,
    reply_to_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT quiz_feedback_pkey PRIMARY KEY (id),
    CONSTRAINT quiz_feedback_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id),
    CONSTRAINT quiz_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT quiz_feedback_reply_to_id_fkey FOREIGN KEY (reply_to_id) REFERENCES public.quiz_feedback(id)
);

-- Quiz permissions system
CREATE TABLE IF NOT EXISTS public.quiz_permissions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    quiz_id uuid,
    user_id uuid,
    permission_level permission_level DEFAULT 'view'::permission_level,
    granted_by uuid,
    granted_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT quiz_permissions_pkey PRIMARY KEY (id),
    CONSTRAINT quiz_permissions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id),
    CONSTRAINT quiz_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT quiz_permissions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES auth.users(id)
);

-- =====================================================
-- 8. TEMPLATE & GROUP SYSTEM
-- =====================================================

-- Question templates for reusability
CREATE TABLE IF NOT EXISTS public.question_templates (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    category text NOT NULL DEFAULT 'general'::text,
    difficulty text NOT NULL DEFAULT 'intermediate'::text CHECK (difficulty = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])),
    question_type text NOT NULL CHECK (question_type = ANY (ARRAY['multiple_choice'::text, 'true_false'::text, 'fill_blank'::text, 'essay'::text, 'matching'::text, 'ordering'::text])),
    question_data jsonb NOT NULL DEFAULT '{}'::jsonb,
    tags text[] DEFAULT ARRAY[]::text[],
    usage_count integer DEFAULT 0,
    created_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT question_templates_pkey PRIMARY KEY (id),
    CONSTRAINT question_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- Quiz templates
CREATE TABLE IF NOT EXISTS public.quiz_templates (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying NOT NULL,
    description text,
    template_data jsonb NOT NULL,
    category_id uuid,
    created_by uuid,
    is_public boolean DEFAULT false,
    usage_count integer DEFAULT 0,
    rating numeric DEFAULT 0,
    tags text[] DEFAULT '{}',
    thumbnail_url character varying,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT quiz_templates_pkey PRIMARY KEY (id),
    CONSTRAINT quiz_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- Quiz groups for collaborative learning
CREATE TABLE IF NOT EXISTS public.quiz_groups (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying NOT NULL,
    description text,
    created_by uuid,
    is_public boolean DEFAULT false,
    join_code character varying UNIQUE,
    max_members integer DEFAULT 50,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT quiz_groups_pkey PRIMARY KEY (id),
    CONSTRAINT quiz_groups_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- Quiz group members
CREATE TABLE IF NOT EXISTS public.quiz_group_members (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    group_id uuid,
    user_id uuid,
    role character varying DEFAULT 'member'::character varying,
    joined_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT quiz_group_members_pkey PRIMARY KEY (id),
    CONSTRAINT quiz_group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.quiz_groups(id),
    CONSTRAINT quiz_group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- =====================================================
-- 9. LEARNING PATH SYSTEM
-- =====================================================

-- Learning paths for structured progression
CREATE TABLE IF NOT EXISTS public.learning_paths (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying NOT NULL,
    description text,
    quiz_ids uuid[] DEFAULT '{}'::uuid[],
    prerequisites uuid[] DEFAULT '{}'::uuid[],
    completion_criteria jsonb DEFAULT '{"min_score": 70, "pass_rate": 0.8}'::jsonb,
    estimated_hours numeric,
    difficulty_level character varying DEFAULT 'beginner'::character varying,
    category_id uuid,
    is_public boolean DEFAULT false,
    created_by uuid,
    tags text[] DEFAULT '{}'::text[],
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT learning_paths_pkey PRIMARY KEY (id),
    CONSTRAINT learning_paths_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- Learning path progress tracking
CREATE TABLE IF NOT EXISTS public.learning_path_progress (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    learning_path_id uuid,
    current_quiz_index integer DEFAULT 0,
    completed_quizzes uuid[] DEFAULT '{}'::uuid[],
    progress_percentage numeric DEFAULT 0,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    last_activity_at timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT learning_path_progress_pkey PRIMARY KEY (id),
    CONSTRAINT learning_path_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT learning_path_progress_learning_path_id_fkey FOREIGN KEY (learning_path_id) REFERENCES public.learning_paths(id)
);

-- =====================================================
-- 10. GAMIFICATION SYSTEM
-- =====================================================

-- Badges system
CREATE TABLE IF NOT EXISTS public.badges (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying NOT NULL UNIQUE,
    description text,
    icon_url character varying,
    criteria jsonb NOT NULL,
    points integer DEFAULT 0,
    rarity badge_rarity DEFAULT 'common'::badge_rarity,
    category character varying,
    is_active boolean DEFAULT true,
    auto_award boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT badges_pkey PRIMARY KEY (id)
);

-- User badges
CREATE TABLE IF NOT EXISTS public.user_badges (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    badge_id uuid,
    awarded_at timestamp with time zone DEFAULT now(),
    awarded_by uuid,
    progress_data jsonb DEFAULT '{}'::jsonb,
    is_displayed boolean DEFAULT true,
    quiz_id uuid,
    learning_path_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT user_badges_pkey PRIMARY KEY (id),
    CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badges(id),
    CONSTRAINT user_badges_awarded_by_fkey FOREIGN KEY (awarded_by) REFERENCES auth.users(id),
    CONSTRAINT user_badges_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id),
    CONSTRAINT user_badges_learning_path_id_fkey FOREIGN KEY (learning_path_id) REFERENCES public.learning_paths(id)
);

-- Leaderboards
CREATE TABLE IF NOT EXISTS public.leaderboards (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying NOT NULL,
    description text,
    quiz_id uuid,
    category_id uuid,
    learning_path_id uuid,
    leaderboard_type character varying DEFAULT 'score'::character varying,
    time_period character varying DEFAULT 'all_time'::character varying,
    max_entries integer DEFAULT 100,
    is_public boolean DEFAULT true,
    reset_frequency character varying,
    last_reset timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT leaderboards_pkey PRIMARY KEY (id),
    CONSTRAINT leaderboards_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id),
    CONSTRAINT leaderboards_learning_path_id_fkey FOREIGN KEY (learning_path_id) REFERENCES public.learning_paths(id)
);

-- Leaderboard entries
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    leaderboard_id uuid,
    user_id uuid,
    score numeric NOT NULL,
    additional_data jsonb DEFAULT '{}'::jsonb,
    rank_position integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT leaderboard_entries_pkey PRIMARY KEY (id),
    CONSTRAINT leaderboard_entries_leaderboard_id_fkey FOREIGN KEY (leaderboard_id) REFERENCES public.leaderboards(id),
    CONSTRAINT leaderboard_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- User statistics
CREATE TABLE IF NOT EXISTS public.user_stats (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE,
    total_points integer DEFAULT 0,
    quizzes_completed integer DEFAULT 0,
    courses_enrolled integer DEFAULT 0,
    courses_completed integer DEFAULT 0,
    average_score numeric DEFAULT 0,
    study_streak_days integer DEFAULT 0,
    longest_streak_days integer DEFAULT 0,
    last_activity_date date,
    badges_earned integer DEFAULT 0,
    total_study_time_minutes integer DEFAULT 0,
    preferred_categories text[] DEFAULT '{}',
    performance_trends jsonb DEFAULT '{}'::jsonb,
    achievement_data jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_stats_pkey PRIMARY KEY (id),
    CONSTRAINT user_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- =====================================================
-- 11. E-COMMERCE SYSTEM
-- =====================================================

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    total_amount numeric NOT NULL,
    currency text DEFAULT 'USD'::text,
    status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'cancelled'::text, 'refunded'::text])),
    payment_method text,
    payment_intent_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT orders_pkey PRIMARY KEY (id),
    CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Order items
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL,
    course_id uuid NOT NULL,
    price_paid numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT order_items_pkey PRIMARY KEY (id),
    CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
    CONSTRAINT order_items_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);

-- Certificates
CREATE TABLE IF NOT EXISTS public.certificates (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    course_id uuid NOT NULL,
    certificate_number text NOT NULL UNIQUE,
    issued_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    pdf_url text,
    is_valid boolean DEFAULT true,
    CONSTRAINT certificates_pkey PRIMARY KEY (id),
    CONSTRAINT certificates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
    CONSTRAINT certificates_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);

-- =====================================================
-- 12. NOTIFICATION & ADMIN SYSTEM
-- =====================================================

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL CHECK (type = ANY (ARRAY['enrollment'::text, 'assignment'::text, 'achievement'::text, 'announcement'::text, 'reminder'::text])),
    is_read boolean DEFAULT false,
    action_url text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notifications_pkey PRIMARY KEY (id),
    CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Admin activity logs
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    admin_user_id uuid NOT NULL,
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id uuid NOT NULL,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT admin_activity_logs_pkey PRIMARY KEY (id),
    CONSTRAINT admin_activity_logs_admin_user_id_fkey FOREIGN KEY (admin_user_id) REFERENCES public.users(id)
);

-- =====================================================
-- 13. AI & CONTENT REVIEW SYSTEM
-- =====================================================

-- Content reviews for AI-generated content
CREATE TABLE IF NOT EXISTS public.content_reviews (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    content_type character varying NOT NULL,
    content_id uuid,
    title character varying NOT NULL,
    description text,
    generated_by_ai boolean DEFAULT true,
    ai_model character varying,
    generation_prompt text,
    raw_ai_response text,
    review_status character varying DEFAULT 'pending'::character varying,
    priority character varying DEFAULT 'medium'::character varying,
    ai_confidence_score numeric DEFAULT 0.00,
    quality_score numeric,
    validation_issues jsonb DEFAULT '[]'::jsonb,
    reviewer_notes text,
    auto_corrected boolean DEFAULT false,
    corrected_content text,
    language character varying DEFAULT 'english'::character varying,
    subject character varying,
    difficulty character varying,
    estimated_review_time integer DEFAULT 10,
    actual_review_time integer,
    created_by uuid,
    reviewed_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    reviewed_at timestamp with time zone,
    approved_at timestamp with time zone,
    CONSTRAINT content_reviews_pkey PRIMARY KEY (id),
    CONSTRAINT content_reviews_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
    CONSTRAINT content_reviews_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id)
);

-- =====================================================
-- 14. PERFORMANCE INDEXES
-- =====================================================

-- Core system indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_categories_active_parent ON public.categories(is_active, parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_subject_level ON public.categories(subject_id, level);

-- Course system indexes
CREATE INDEX IF NOT EXISTS idx_courses_instructor_published ON public.courses(instructor_id, is_published);
CREATE INDEX IF NOT EXISTS idx_courses_category_published ON public.courses(category, is_published);
CREATE INDEX IF NOT EXISTS idx_courses_status_published ON public.courses(status, published_at);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON public.enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON public.lesson_progress(user_id, lesson_id);

-- Quiz system indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_published ON public.quizzes(is_published);
CREATE INDEX IF NOT EXISTS idx_quizzes_category ON public.quizzes(category);
CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty ON public.quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_order ON public.quiz_questions(quiz_id, order_index);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_type ON public.quiz_questions(question_type);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON public.quiz_attempts(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed ON public.quiz_attempts(completed_at);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_score ON public.quiz_attempts(score);

-- Advanced feature indexes
CREATE INDEX IF NOT EXISTS idx_question_attempts_quiz_attempt ON public.question_attempts(quiz_attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_active ON public.quiz_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_learning_path_progress_user ON public.learning_path_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_board_rank ON public.leaderboard_entries(leaderboard_id, rank_position);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_content_reviews_status ON public.content_reviews(review_status);

-- =====================================================
-- 15. FUNCTIONS & TRIGGERS
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

-- Function to update user statistics
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.user_stats (user_id, quizzes_completed, average_score)
        VALUES (NEW.user_id, 1, NEW.percentage_score)
        ON CONFLICT (user_id) 
        DO UPDATE SET
            quizzes_completed = user_stats.quizzes_completed + 1,
            average_score = (user_stats.average_score * user_stats.quizzes_completed + NEW.percentage_score) / (user_stats.quizzes_completed + 1),
            last_activity_date = CURRENT_DATE,
            updated_at = now();
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user stats
DROP TRIGGER IF EXISTS trigger_update_user_stats ON public.quiz_attempts;
CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT ON public.quiz_attempts
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- =====================================================
-- 16. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

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

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

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
-- 17. STORAGE BUCKETS & POLICIES
-- =====================================================

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('course-images', 'course-images', true),
    ('quiz-images', 'quiz-images', true),
    ('user-avatars', 'user-avatars', true),
    ('lesson-resources', 'lesson-resources', false),
    ('question-media', 'question-media', true),
    ('certificates', 'certificates', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view public images" ON storage.objects FOR SELECT USING (bucket_id IN ('course-images', 'quiz-images', 'question-media'));
CREATE POLICY "Authenticated users can upload content" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can manage own uploads" ON storage.objects FOR UPDATE USING (auth.uid()::text = owner);
CREATE POLICY "Users can delete own uploads" ON storage.objects FOR DELETE USING (auth.uid()::text = owner);

-- =====================================================
-- 18. SAMPLE DATA (Optional)
-- =====================================================

-- Insert sample subjects
INSERT INTO public.subjects (name, slug, description, icon, color) VALUES
    ('English Language', 'english', 'English language learning and proficiency', 'Globe', '#3B82F6'),
    ('Test Preparation', 'test-prep', 'Standardized test preparation courses', 'Target', '#DC2626'),
    ('Business English', 'business', 'Professional English communication', 'Briefcase', '#059669'),
    ('Academic English', 'academic', 'Academic writing and research skills', 'GraduationCap', '#7C3AED')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample categories
INSERT INTO public.categories (subject_id, name, slug, description, color, icon, level) 
SELECT 
    s.id,
    c.name,
    c.slug,
    c.description,
    c.color,
    c.icon,
    c.level
FROM public.subjects s
CROSS JOIN (VALUES
    ('English Grammar', 'grammar', 'Essential grammar rules and exercises', '#3B82F6', 'BookOpen', 1),
    ('Vocabulary Building', 'vocabulary', 'Word learning and usage', '#10B981', 'Book', 1),
    ('Speaking Practice', 'speaking', 'Conversation and pronunciation', '#F59E0B', 'Mic', 1),
    ('Reading Comprehension', 'reading', 'Text understanding and analysis', '#8B5CF6', 'FileText', 1),
    ('Writing Skills', 'writing', 'Essay and creative writing', '#EF4444', 'PenTool', 1),
    ('Listening Skills', 'listening', 'Audio comprehension and dictation', '#06B6D4', 'Headphones', 1),
    ('IELTS Reading', 'ielts-reading', 'IELTS reading preparation and practice', '#DC2626', 'FileText', 2),
    ('TOEFL Reading', 'toefl-reading', 'TOEFL reading comprehension tests', '#EA580C', 'FileText', 2),
    ('Business Communication', 'business-comm', 'Professional communication skills', '#059669', 'Briefcase', 2),
    ('Academic Writing', 'academic-writing', 'Scholarly and research writing', '#7C3AED', 'GraduationCap', 2)
) AS c(name, slug, description, color, icon, level)
WHERE s.slug = 'english'
ON CONFLICT (slug) DO NOTHING;

-- Insert sample badges
INSERT INTO public.badges (name, description, icon_url, criteria, points, rarity, category) VALUES
    ('First Quiz Completed', 'Complete your first quiz', '/badges/first-quiz.svg', '{"quiz_attempts": 1}', 10, 'common', 'achievement'),
    ('Perfect Score', 'Get 100% on any quiz', '/badges/perfect.svg', '{"perfect_score": true}', 50, 'uncommon', 'performance'),
    ('Speed Reader', 'Complete a reading quiz in under 5 minutes', '/badges/speed.svg', '{"reading_quiz_time": 300}', 30, 'rare', 'skill'),
    ('Quiz Master', 'Complete 50 quizzes', '/badges/master.svg', '{"quiz_attempts": 50}', 200, 'epic', 'achievement'),
    ('Streak Champion', 'Maintain a 7-day study streak', '/badges/streak.svg', '{"study_streak": 7}', 100, 'rare', 'habit')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Verify the setup
SELECT 'Advanced database schema V3 setup completed successfully!' as status;

-- Show table counts
SELECT 
    'Tables created:' as info,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Show key feature summary
SELECT 
    'Advanced Features Included:' as feature_summary,
    string_agg(feature, ', ') as features
FROM (VALUES
    ('✅ Complete Quiz System with Reading Support'),
    ('✅ Advanced Analytics & Question Tracking'),
    ('✅ Gamification (Badges, Leaderboards)'),
    ('✅ Learning Paths & Templates'),
    ('✅ E-commerce & Certificates'),
    ('✅ AI Content Review System'),
    ('✅ Group Collaboration Features'),
    ('✅ Adaptive Quiz Settings'),
    ('✅ Comprehensive Admin Logging'),
    ('✅ Performance Optimized Indexes')
) AS features(feature);