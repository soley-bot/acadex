-- Database Schema Enhancements for Acadex Platform
-- Run these commands in your Supabase SQL editor

-- =============================================================================
-- 1. ADD MISSING COURSE FIELDS
-- =============================================================================

-- Add course thumbnail/image support
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS video_preview_url TEXT;

-- Add course metadata
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS prerequisites TEXT[],
ADD COLUMN IF NOT EXISTS learning_objectives TEXT[];

-- Add course status tracking
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Add pricing options
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS original_price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;

-- =============================================================================
-- 2. ADD COURSE CONTENT MANAGEMENT
-- =============================================================================

-- Create course modules/sections table
CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, order_index)
);

-- Create course lessons table
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT, -- Lesson content/transcript
    video_url TEXT,
    duration_minutes INTEGER DEFAULT 0,
    order_index INTEGER NOT NULL,
    is_published BOOLEAN DEFAULT false,
    is_free_preview BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module_id, order_index)
);

-- Create course attachments/resources table
CREATE TABLE IF NOT EXISTS public.course_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'pdf', 'doc', 'video', 'audio', 'zip', etc.
    file_size_bytes BIGINT,
    is_downloadable BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Either course-level or lesson-level resource
    CHECK ((course_id IS NOT NULL AND lesson_id IS NULL) OR (course_id IS NULL AND lesson_id IS NOT NULL))
);

-- =============================================================================
-- 3. ENHANCE USER PROGRESS TRACKING
-- =============================================================================

-- Add detailed enrollment tracking
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS current_lesson_id UUID REFERENCES public.course_lessons(id),
ADD COLUMN IF NOT EXISTS total_watch_time_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS certificate_issued_at TIMESTAMP WITH TIME ZONE;

-- Create lesson progress tracking
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    watch_time_minutes INTEGER DEFAULT 0,
    last_position_seconds INTEGER DEFAULT 0, -- For video resuming
    completed_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- =============================================================================
-- 4. ADD QUIZ ENHANCEMENTS
-- =============================================================================

-- Link quizzes to specific courses/lessons
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS passing_score INTEGER DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 0, -- 0 = unlimited
ADD COLUMN IF NOT EXISTS time_limit_minutes INTEGER;

-- Add quiz question improvements
ALTER TABLE public.quiz_questions 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard'));

-- Add quiz question media support
ALTER TABLE public.quiz_questions 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Track quiz attempt details
ALTER TABLE public.quiz_attempts 
ADD COLUMN IF NOT EXISTS passed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS percentage_score NUMERIC,
ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1;

-- =============================================================================
-- 5. ADD REVIEWS AND RATINGS SYSTEM
-- =============================================================================

-- Create course reviews table
CREATE TABLE IF NOT EXISTS public.course_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, user_id)
);

-- =============================================================================
-- 6. ADD NOTIFICATIONS SYSTEM
-- =============================================================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('enrollment', 'assignment', 'achievement', 'announcement', 'reminder')),
    is_read BOOLEAN DEFAULT false,
    action_url TEXT, -- Optional link for click action
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 7. ADD CERTIFICATES SYSTEM
-- =============================================================================

-- Create certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    certificate_number TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    pdf_url TEXT,
    is_valid BOOLEAN DEFAULT true,
    UNIQUE(user_id, course_id)
);

-- =============================================================================
-- 8. ADD PAYMENT AND ORDER TRACKING
-- =============================================================================

-- Create orders table for course purchases
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    total_amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    payment_method TEXT,
    payment_intent_id TEXT, -- For Stripe/payment processor
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order items for courses purchased
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    price_paid NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 9. ADD ADMIN ACTIVITY LOGS
-- =============================================================================

-- Create activity logs for admin actions
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'publish', 'archive'
    resource_type TEXT NOT NULL, -- 'course', 'quiz', 'user', 'order'
    resource_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 10. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Course-related indexes
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_is_free ON public.courses(is_free);
CREATE INDEX IF NOT EXISTS idx_courses_published_at ON public.courses(published_at);

-- Module and lesson indexes
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_order ON public.course_modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON public.course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_order ON public.course_lessons(module_id, order_index);

-- Progress tracking indexes
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_last_accessed ON public.enrollments(last_accessed_at);

-- Quiz-related indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON public.quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON public.quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON public.quiz_attempts(user_id, quiz_id);

-- Review and notification indexes
CREATE INDEX IF NOT EXISTS idx_course_reviews_course_id ON public.course_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_rating ON public.course_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- Order and payment indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_user ON public.admin_activity_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_resource ON public.admin_activity_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_activity_logs(created_at);

-- =============================================================================
-- 11. UPDATE ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 12. CREATE FUNCTIONS FOR AUTOMATED TASKS
-- =============================================================================

-- Function to update course rating when reviews are added/updated
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.courses 
    SET rating = (
        SELECT ROUND(AVG(rating), 2) 
        FROM public.course_reviews 
        WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
    )
    WHERE id = COALESCE(NEW.course_id, OLD.course_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update course ratings
DROP TRIGGER IF EXISTS trigger_update_course_rating ON public.course_reviews;
CREATE TRIGGER trigger_update_course_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.course_reviews
    FOR EACH ROW EXECUTE FUNCTION update_course_rating();

-- Function to update enrollment progress based on lesson completion
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
DECLARE
    course_id_var UUID;
    total_lessons INTEGER;
    completed_lessons INTEGER;
    progress_percentage INTEGER;
BEGIN
    -- Get course_id from lesson
    SELECT cm.course_id INTO course_id_var
    FROM public.course_lessons cl
    JOIN public.course_modules cm ON cl.module_id = cm.id
    WHERE cl.id = NEW.lesson_id;
    
    -- Count total lessons in course
    SELECT COUNT(*) INTO total_lessons
    FROM public.course_lessons cl
    JOIN public.course_modules cm ON cl.module_id = cm.id
    WHERE cm.course_id = course_id_var;
    
    -- Count completed lessons for this user
    SELECT COUNT(*) INTO completed_lessons
    FROM public.lesson_progress lp
    JOIN public.course_lessons cl ON lp.lesson_id = cl.id
    JOIN public.course_modules cm ON cl.module_id = cm.id
    WHERE cm.course_id = course_id_var 
    AND lp.user_id = NEW.user_id 
    AND lp.is_completed = true;
    
    -- Calculate progress percentage
    IF total_lessons > 0 THEN
        progress_percentage := ROUND((completed_lessons::NUMERIC / total_lessons::NUMERIC) * 100);
    ELSE
        progress_percentage := 0;
    END IF;
    
    -- Update enrollment progress
    UPDATE public.enrollments 
    SET 
        progress = progress_percentage,
        last_accessed_at = NOW(),
        completed_at = CASE WHEN progress_percentage = 100 THEN NOW() ELSE completed_at END
    WHERE user_id = NEW.user_id AND course_id = course_id_var;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update enrollment progress when lessons are completed
DROP TRIGGER IF EXISTS trigger_update_enrollment_progress_insert ON public.lesson_progress;
DROP TRIGGER IF EXISTS trigger_update_enrollment_progress_update ON public.lesson_progress;

-- Separate trigger for INSERT (when lesson is completed on first attempt)
CREATE TRIGGER trigger_update_enrollment_progress_insert
    AFTER INSERT ON public.lesson_progress
    FOR EACH ROW 
    WHEN (NEW.is_completed = true)
    EXECUTE FUNCTION update_enrollment_progress();

-- Separate trigger for UPDATE (when lesson completion status changes)
CREATE TRIGGER trigger_update_enrollment_progress_update
    AFTER UPDATE ON public.lesson_progress
    FOR EACH ROW 
    WHEN (NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false))
    EXECUTE FUNCTION update_enrollment_progress();

-- Function to generate certificate numbers
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.certificate_number := 'CERT-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(NEXTVAL('certificate_sequence')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for certificate numbers
CREATE SEQUENCE IF NOT EXISTS certificate_sequence START 1;

-- Trigger to auto-generate certificate numbers
DROP TRIGGER IF EXISTS trigger_generate_certificate_number ON public.certificates;
CREATE TRIGGER trigger_generate_certificate_number
    BEFORE INSERT ON public.certificates
    FOR EACH ROW EXECUTE FUNCTION generate_certificate_number();

-- =============================================================================
-- SUMMARY
-- =============================================================================

-- This enhancement adds:
-- ✅ Course content management (modules, lessons, resources)
-- ✅ Advanced progress tracking
-- ✅ Quiz improvements with media support
-- ✅ Reviews and ratings system
-- ✅ Notifications system
-- ✅ Certificates system
-- ✅ Payment and order tracking
-- ✅ Admin activity logging
-- ✅ Performance indexes
-- ✅ Automated functions and triggers
-- ✅ Row Level Security setup

COMMENT ON SCHEMA public IS 'Enhanced Acadex Learning Platform Database - Complete with course content, progress tracking, payments, and admin features';
