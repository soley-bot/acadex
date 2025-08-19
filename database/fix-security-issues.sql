-- =====================================================
-- FIX SUPABASE SECURITY ISSUES
-- =====================================================
-- This script addresses the security warnings from Supabase
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. FIX FUNCTION SEARCH PATH ISSUES
-- =====================================================
-- Set search_path for all functions to prevent security vulnerabilities

-- Fix calculate_user_level function
CREATE OR REPLACE FUNCTION public.calculate_user_level(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_score INTEGER;
    level_result INTEGER;
BEGIN
    -- Get total score from completed quiz attempts (using score as XP equivalent)
    SELECT COALESCE(SUM(score), 0) INTO total_score
    FROM public.quiz_attempts
    WHERE user_id = user_uuid AND completed_at IS NOT NULL;
    
    -- Calculate level based on total score (100 points per level)
    level_result := GREATEST(1, (total_score / 100) + 1);
    
    RETURN level_result;
END;
$$;

-- Fix check_and_award_badges function
CREATE OR REPLACE FUNCTION public.check_and_award_badges(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    quiz_count INTEGER;
    perfect_scores INTEGER;
    streak_count INTEGER;
BEGIN
    -- Count user's quiz attempts
    SELECT COUNT(*) INTO quiz_count
    FROM public.quiz_attempts
    WHERE user_id = user_uuid;
    
    -- Count perfect scores
    SELECT COUNT(*) INTO perfect_scores
    FROM public.quiz_attempts
    WHERE user_id = user_uuid AND score = 100;
    
    -- Award badges based on achievements
    -- First Quiz Badge
    IF quiz_count >= 1 THEN
        INSERT INTO public.user_badges (user_id, badge_name, awarded_at)
        VALUES (user_uuid, 'First Quiz', NOW())
        ON CONFLICT (user_id, badge_name) DO NOTHING;
    END IF;
    
    -- Quiz Master Badge (10 quizzes)
    IF quiz_count >= 10 THEN
        INSERT INTO public.user_badges (user_id, badge_name, awarded_at)
        VALUES (user_uuid, 'Quiz Master', NOW())
        ON CONFLICT (user_id, badge_name) DO NOTHING;
    END IF;
    
    -- Perfect Score Badge
    IF perfect_scores >= 1 THEN
        INSERT INTO public.user_badges (user_id, badge_name, awarded_at)
        VALUES (user_uuid, 'Perfect Score', NOW())
        ON CONFLICT (user_id, badge_name) DO NOTHING;
    END IF;
END;
$$;

-- Fix update_question_analytics function (simplified for basic schema)
CREATE OR REPLACE FUNCTION public.update_question_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- This function is a placeholder for future analytics functionality
    -- Currently no question_analytics table exists in the basic schema
    RETURN NEW;
END;
$$;

-- Fix get_course_content function (drop first to handle return type conflicts)
DROP FUNCTION IF EXISTS public.get_course_content(UUID);

CREATE FUNCTION public.get_course_content(course_uuid UUID)
RETURNS TABLE (
  module_id UUID,
  module_title TEXT,
  module_description TEXT,
  module_order INTEGER,
  lesson_id UUID,
  lesson_title TEXT,
  lesson_description TEXT,
  lesson_content TEXT,
  lesson_video_url TEXT,
  lesson_duration_minutes INTEGER,
  lesson_order INTEGER,
  lesson_is_published BOOLEAN,
  lesson_is_free_preview BOOLEAN,
  lesson_quiz_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id as module_id,
    cm.title as module_title,
    cm.description as module_description,
    cm.order_index as module_order,
    cl.id as lesson_id,
    cl.title as lesson_title,
    cl.description as lesson_description,
    cl.content as lesson_content,
    cl.video_url as lesson_video_url,
    cl.duration_minutes as lesson_duration_minutes,
    cl.order_index as lesson_order,
    cl.is_published as lesson_is_published,
    cl.is_free_preview as lesson_is_free_preview,
    cl.quiz_id as lesson_quiz_id
  FROM public.course_modules cm
  LEFT JOIN public.course_lessons cl ON cm.id = cl.module_id
  WHERE cm.course_id = course_uuid
  ORDER BY cm.order_index, cl.order_index;
END;
$$;

-- Fix get_course_stats function (drop first to handle return type conflicts)
DROP FUNCTION IF EXISTS public.get_course_stats(UUID);

CREATE FUNCTION public.get_course_stats(course_uuid UUID)
RETURNS TABLE (
  total_modules INTEGER,
  total_lessons INTEGER,
  total_duration_minutes INTEGER,
  published_lessons INTEGER,
  free_preview_lessons INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT cm.id)::INTEGER as total_modules,
    COUNT(cl.id)::INTEGER as total_lessons,
    COALESCE(SUM(cl.duration_minutes), 0)::INTEGER as total_duration_minutes,
    COUNT(cl.id) FILTER (WHERE cl.is_published = true)::INTEGER as published_lessons,
    COUNT(cl.id) FILTER (WHERE cl.is_free_preview = true)::INTEGER as free_preview_lessons
  FROM public.course_modules cm
  LEFT JOIN public.course_lessons cl ON cm.id = cl.module_id
  WHERE cm.course_id = course_uuid;
END;
$$;

-- Fix get_quiz_stats function (drop first to handle return type conflicts)
DROP FUNCTION IF EXISTS public.get_quiz_stats(UUID);

CREATE FUNCTION public.get_quiz_stats(quiz_uuid UUID)
RETURNS TABLE (
  total_attempts INTEGER,
  avg_score DECIMAL,
  completion_rate DECIMAL,
  total_questions INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(qa.id)::INTEGER as total_attempts,
    COALESCE(AVG(qa.score), 0)::DECIMAL as avg_score,
    CASE 
      WHEN COUNT(qa.id) > 0 
      THEN (COUNT(qa.id) FILTER (WHERE qa.completed_at IS NOT NULL)::DECIMAL / COUNT(qa.id)) * 100
      ELSE 0 
    END as completion_rate,
    COUNT(DISTINCT q.id)::INTEGER as total_questions
  FROM public.quiz_attempts qa
  LEFT JOIN public.questions q ON qa.quiz_id = q.quiz_id
  WHERE qa.quiz_id = quiz_uuid;
END;
$$;

-- Fix get_user_quiz_attempts function (drop first to handle return type conflicts)
DROP FUNCTION IF EXISTS public.get_user_quiz_attempts(UUID, INTEGER);
DROP FUNCTION IF EXISTS public.get_user_quiz_attempts(UUID);

CREATE FUNCTION public.get_user_quiz_attempts(user_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  quiz_id UUID,
  quiz_title TEXT,
  score INTEGER,
  completed_at TIMESTAMPTZ,
  time_taken INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qa.quiz_id,
    q.title as quiz_title,
    qa.score,
    qa.completed_at,
    qa.time_taken
  FROM public.quiz_attempts qa
  JOIN public.quizzes q ON qa.quiz_id = q.id
  WHERE qa.user_id = user_uuid 
    AND qa.completed_at IS NOT NULL
  ORDER BY qa.completed_at DESC
  LIMIT limit_count;
END;
$$;

-- Fix update_categories_updated_at function
CREATE OR REPLACE FUNCTION public.update_categories_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix simple_update_updated_at function
CREATE OR REPLACE FUNCTION public.simple_update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 2. FIX SECURITY DEFINER VIEWS
-- =====================================================
-- Review and recreate views with proper security

-- Drop potentially problematic views and recreate with proper access controls
DROP VIEW IF EXISTS public.user_performance CASCADE;
DROP VIEW IF EXISTS public.question_difficulty_analysis CASCADE;
DROP VIEW IF EXISTS public.quiz_statistics CASCADE;

-- Create secure user_performance view
CREATE VIEW public.user_performance 
WITH (security_invoker = true)
AS
SELECT 
    u.id as user_id,
    u.email,
    u.role,
    COUNT(qa.id) as total_attempts,
    AVG(qa.score) as avg_score,
    SUM(qa.score) as total_score,
    public.calculate_user_level(u.id) as current_level
FROM public.users u
LEFT JOIN public.quiz_attempts qa ON u.id = qa.user_id
WHERE qa.completed_at IS NOT NULL
GROUP BY u.id, u.email, u.role;

-- Create secure question_difficulty_analysis view (simplified for basic schema)
CREATE VIEW public.question_difficulty_analysis
WITH (security_invoker = true)
AS
SELECT 
    q.id as question_id,
    q.question_text,
    qz.title as quiz_title,
    0 as total_attempts,
    0 as correct_attempts,
    0 as difficulty_score,
    'Medium' as difficulty_level
FROM public.questions q
JOIN public.quizzes qz ON q.quiz_id = qz.id;

-- Create secure quiz_statistics view
CREATE VIEW public.quiz_statistics
WITH (security_invoker = true)
AS
SELECT 
    q.id as quiz_id,
    q.title,
    q.description,
    q.difficulty,
    COUNT(DISTINCT qa.id) as total_attempts,
    COUNT(DISTINCT qa.user_id) as unique_users,
    AVG(qa.score) as avg_score,
    COUNT(qa.id) FILTER (WHERE qa.completed_at IS NOT NULL) as completed_attempts,
    COUNT(DISTINCT qs.id) as total_questions
FROM public.quizzes q
LEFT JOIN public.quiz_attempts qa ON q.id = qa.quiz_id
LEFT JOIN public.questions qs ON q.id = qs.quiz_id
GROUP BY q.id, q.title, q.description, q.difficulty;

-- 3. ENSURE PROPER RLS POLICIES ON VIEWS
-- =====================================================

-- Enable RLS on auth.users (if not already enabled)
-- Note: This should be handled carefully as it's a system table
-- ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Add policies to ensure views respect user permissions
-- Users can only see their own performance data unless they're admin
CREATE POLICY "user_performance_policy" ON public.users
  FOR SELECT
  USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. VERIFICATION QUERIES
-- =====================================================

-- Check function security settings
SELECT 
    routine_name,
    routine_type,
    security_type,
    CASE 
        WHEN prosecdef AND proconfig IS NOT NULL AND 'search_path' = ANY(string_to_array(array_to_string(proconfig, ','), '='))
        THEN '✅ Secure (SECURITY DEFINER with search_path)'
        WHEN prosecdef 
        THEN '⚠️ SECURITY DEFINER without search_path'
        ELSE '✅ SECURITY INVOKER'
    END as security_status
FROM information_schema.routines r
LEFT JOIN pg_proc p ON r.routine_name = p.proname
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Check view security settings
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_views 
            WHERE viewname = table_name 
            AND schemaname = 'public'
            AND definition LIKE '%security_invoker%'
        )
        THEN '✅ Security Invoker'
        ELSE '⚠️ Security Definer (potential risk)'
    END as view_security_status
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- Show summary
SELECT 'Database security fixes applied successfully! Review the verification queries above.' as status;
