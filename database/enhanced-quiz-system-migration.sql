-- ===============================================
-- ENHANCED QUIZ SYSTEM DATABASE MIGRATION
-- ===============================================
-- This script enhances the existing quiz system with modern features
-- Run this after your current database setup

-- Create custom types first
DO $$ 
BEGIN
    -- Enhanced question types
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enhanced_question_type') THEN
        CREATE TYPE enhanced_question_type AS ENUM (
            'multiple_choice', 'single_choice', 'true_false', 
            'fill_blank', 'essay', 'matching', 'ordering', 
            'drag_drop', 'hotspot', 'numeric', 'slider'
        );
    END IF;
    
    -- Permission levels
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission_level') THEN
        CREATE TYPE permission_level AS ENUM ('view', 'edit', 'admin', 'owner');
    END IF;
    
    -- Badge rarity
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'badge_rarity') THEN
        CREATE TYPE badge_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
    END IF;
    
    -- Media roles
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_role') THEN
        CREATE TYPE media_role AS ENUM ('question', 'option', 'explanation', 'feedback');
    END IF;
END $$;

-- ===============================================
-- 1. ENHANCE EXISTING QUIZ TABLE
-- ===============================================

-- Add missing fields to quizzes table
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS shuffle_questions boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS shuffle_options boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_results_immediately boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_review boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_backtrack boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS randomize_questions boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS questions_per_page integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS show_progress boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_submit boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS instructions text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS estimated_time_minutes integer,
ADD COLUMN IF NOT EXISTS retake_policy jsonb DEFAULT '{"allowed": true, "max_attempts": 0, "cooldown_hours": 0}',
ADD COLUMN IF NOT EXISTS grading_policy jsonb DEFAULT '{"method": "highest", "show_correct_answers": true, "partial_credit": false}',
ADD COLUMN IF NOT EXISTS availability_window jsonb DEFAULT '{"start_date": null, "end_date": null, "timezone": "UTC"}',
ADD COLUMN IF NOT EXISTS proctoring_settings jsonb DEFAULT '{"enabled": false, "webcam": false, "screen_lock": false, "time_warnings": [300, 60]}',
ADD COLUMN IF NOT EXISTS certificate_template_id uuid,
ADD COLUMN IF NOT EXISTS analytics_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS public_results boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_anonymous boolean DEFAULT false;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_quizzes_category ON quizzes(category);
CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty ON quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_quizzes_is_published ON quizzes(is_published);
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_tags ON quizzes USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_at ON quizzes(created_at);

-- ===============================================
-- 2. ENHANCE EXISTING QUIZ_QUESTIONS TABLE
-- ===============================================

-- Add enhanced fields to quiz_questions
ALTER TABLE quiz_questions 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS time_limit_seconds integer,
ADD COLUMN IF NOT EXISTS required boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS randomize_options boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS partial_credit boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS feedback_correct text,
ADD COLUMN IF NOT EXISTS feedback_incorrect text,
ADD COLUMN IF NOT EXISTS hint text,
ADD COLUMN IF NOT EXISTS question_metadata jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS conditional_logic jsonb,
ADD COLUMN IF NOT EXISTS weight numeric DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS auto_grade boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS rubric jsonb;

-- Add indexes for quiz_questions
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_order_index ON quiz_questions(order_index);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_question_type ON quiz_questions(question_type);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_tags ON quiz_questions USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty_level ON quiz_questions(difficulty_level);

-- ===============================================
-- 3. QUIZ CATEGORIES SYSTEM
-- ===============================================

CREATE TABLE IF NOT EXISTS quiz_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL UNIQUE,
    description text,
    color varchar(7) DEFAULT '#3B82F6',
    icon varchar(50),
    parent_id uuid REFERENCES quiz_categories(id) ON DELETE SET NULL,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Insert default categories
INSERT INTO quiz_categories (name, description, color, icon) VALUES
('General Knowledge', 'General knowledge and trivia questions', '#3B82F6', 'book'),
('Science', 'Science and technology questions', '#10B981', 'flask'),
('Mathematics', 'Mathematical problems and calculations', '#F59E0B', 'calculator'),
('Language Arts', 'Grammar, vocabulary, and literature', '#8B5CF6', 'pen-tool'),
('History', 'Historical events and figures', '#EF4444', 'clock'),
('Geography', 'World geography and locations', '#06B6D4', 'globe')
ON CONFLICT (name) DO NOTHING;

-- ===============================================
-- 4. QUIZ TEMPLATES SYSTEM
-- ===============================================

CREATE TABLE IF NOT EXISTS quiz_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    description text,
    template_data jsonb NOT NULL,
    category_id uuid REFERENCES quiz_categories(id) ON DELETE SET NULL,
    created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public boolean DEFAULT false,
    usage_count integer DEFAULT 0,
    rating numeric DEFAULT 0,
    tags text[] DEFAULT '{}',
    thumbnail_url varchar(500),
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ===============================================
-- 5. ADVANCED ANALYTICS TABLES
-- ===============================================

-- Question performance analytics
CREATE TABLE IF NOT EXISTS question_analytics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id uuid REFERENCES quiz_questions(id) ON DELETE CASCADE,
    total_attempts integer DEFAULT 0,
    correct_attempts integer DEFAULT 0,
    average_time_seconds numeric DEFAULT 0,
    difficulty_rating numeric DEFAULT 0,
    discrimination_index numeric DEFAULT 0,
    last_updated timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}',
    CONSTRAINT question_analytics_unique UNIQUE(question_id)
);

-- Detailed attempt tracking for each question
CREATE TABLE IF NOT EXISTS question_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_attempt_id uuid REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id uuid REFERENCES quiz_questions(id) ON DELETE CASCADE,
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
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now()
);

-- Quiz session tracking
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_attempt_id uuid REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
    session_data jsonb DEFAULT '{}',
    started_at timestamp with time zone DEFAULT now(),
    last_activity_at timestamp with time zone DEFAULT now(),
    ended_at timestamp with time zone,
    is_active boolean DEFAULT true,
    user_agent text,
    ip_address inet,
    browser_info jsonb DEFAULT '{}'
);

-- ===============================================
-- 6. MEDIA LIBRARY SYSTEM
-- ===============================================

CREATE TABLE IF NOT EXISTS media_library (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    filename varchar(255) NOT NULL,
    original_name varchar(255),
    file_path varchar(500) NOT NULL,
    file_type varchar(50),
    file_size integer,
    mime_type varchar(100),
    alt_text varchar(255),
    tags text[] DEFAULT '{}',
    is_public boolean DEFAULT false,
    folder_path varchar(500) DEFAULT '',
    thumbnail_url varchar(500),
    metadata jsonb DEFAULT '{}',
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Question media relationships
CREATE TABLE IF NOT EXISTS question_media (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id uuid REFERENCES quiz_questions(id) ON DELETE CASCADE,
    media_id uuid REFERENCES media_library(id) ON DELETE CASCADE,
    media_role media_role DEFAULT 'question',
    display_order integer DEFAULT 0,
    is_required boolean DEFAULT false,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT question_media_unique UNIQUE(question_id, media_id, media_role)
);

-- ===============================================
-- 7. LEARNING PATHS & ADAPTIVE LEARNING
-- ===============================================

CREATE TABLE IF NOT EXISTS learning_paths (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    description text,
    quiz_ids uuid[] DEFAULT '{}',
    prerequisites uuid[] DEFAULT '{}',
    completion_criteria jsonb DEFAULT '{"pass_rate": 0.8, "min_score": 70}',
    estimated_hours numeric,
    difficulty_level varchar(20) DEFAULT 'beginner',
    category_id uuid REFERENCES quiz_categories(id) ON DELETE SET NULL,
    is_public boolean DEFAULT false,
    created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    tags text[] DEFAULT '{}',
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- User progress in learning paths
CREATE TABLE IF NOT EXISTS learning_path_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    learning_path_id uuid REFERENCES learning_paths(id) ON DELETE CASCADE,
    current_quiz_index integer DEFAULT 0,
    completed_quizzes uuid[] DEFAULT '{}',
    progress_percentage numeric DEFAULT 0,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    last_activity_at timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}',
    CONSTRAINT learning_path_progress_unique UNIQUE(user_id, learning_path_id)
);

-- Adaptive quiz settings
CREATE TABLE IF NOT EXISTS adaptive_quiz_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
    enabled boolean DEFAULT false,
    difficulty_adjustment boolean DEFAULT true,
    min_questions integer DEFAULT 5,
    max_questions integer DEFAULT 20,
    target_accuracy numeric DEFAULT 0.7,
    stopping_criteria jsonb DEFAULT '{"confidence": 0.95, "standard_error": 0.3}',
    item_selection_algorithm varchar(50) DEFAULT 'maximum_information',
    theta_estimation_method varchar(50) DEFAULT 'maximum_likelihood',
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT adaptive_quiz_settings_unique UNIQUE(quiz_id)
);

-- ===============================================
-- 8. GAMIFICATION SYSTEM
-- ===============================================

-- Badges and achievements
CREATE TABLE IF NOT EXISTS badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL UNIQUE,
    description text,
    icon_url varchar(500),
    criteria jsonb NOT NULL,
    points integer DEFAULT 0,
    rarity badge_rarity DEFAULT 'common',
    category varchar(50),
    is_active boolean DEFAULT true,
    auto_award boolean DEFAULT true,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- User badges
CREATE TABLE IF NOT EXISTS user_badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id uuid REFERENCES badges(id) ON DELETE CASCADE,
    earned_at timestamp with time zone DEFAULT now(),
    quiz_attempt_id uuid REFERENCES quiz_attempts(id) ON DELETE SET NULL,
    learning_path_id uuid REFERENCES learning_paths(id) ON DELETE SET NULL,
    progress_data jsonb DEFAULT '{}',
    is_featured boolean DEFAULT false,
    metadata jsonb DEFAULT '{}',
    CONSTRAINT user_badges_unique UNIQUE(user_id, badge_id)
);

-- Leaderboards
CREATE TABLE IF NOT EXISTS leaderboards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    description text,
    quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
    category_id uuid REFERENCES quiz_categories(id) ON DELETE SET NULL,
    learning_path_id uuid REFERENCES learning_paths(id) ON DELETE CASCADE,
    leaderboard_type varchar(20) DEFAULT 'score', -- score, time, streak, points
    time_period varchar(20) DEFAULT 'all_time', -- daily, weekly, monthly, all_time
    max_entries integer DEFAULT 100,
    is_public boolean DEFAULT true,
    reset_frequency varchar(20), -- daily, weekly, monthly, never
    last_reset timestamp with time zone,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Leaderboard entries
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    leaderboard_id uuid REFERENCES leaderboards(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    score numeric NOT NULL,
    additional_data jsonb DEFAULT '{}',
    rank_position integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT leaderboard_entries_unique UNIQUE(leaderboard_id, user_id)
);

-- User points and streaks
CREATE TABLE IF NOT EXISTS user_stats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    total_points integer DEFAULT 0,
    current_streak integer DEFAULT 0,
    longest_streak integer DEFAULT 0,
    quizzes_completed integer DEFAULT 0,
    questions_answered integer DEFAULT 0,
    correct_answers integer DEFAULT 0,
    total_time_spent_minutes integer DEFAULT 0,
    achievements_count integer DEFAULT 0,
    last_activity_date date DEFAULT CURRENT_DATE,
    level_id uuid,
    experience_points integer DEFAULT 0,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_stats_unique UNIQUE(user_id)
);

-- ===============================================
-- 9. COLLABORATION & SHARING
-- ===============================================

-- Quiz sharing and permissions
CREATE TABLE IF NOT EXISTS quiz_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_level permission_level DEFAULT 'view',
    granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    granted_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}',
    CONSTRAINT quiz_permissions_unique UNIQUE(quiz_id, user_id)
);

-- Team/group management
CREATE TABLE IF NOT EXISTS quiz_groups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    description text,
    created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public boolean DEFAULT false,
    join_code varchar(20) UNIQUE,
    max_members integer DEFAULT 50,
    settings jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Group members
CREATE TABLE IF NOT EXISTS quiz_group_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid REFERENCES quiz_groups(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role varchar(20) DEFAULT 'member', -- member, moderator, admin
    joined_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}',
    CONSTRAINT quiz_group_members_unique UNIQUE(group_id, user_id)
);

-- Quiz feedback and comments
CREATE TABLE IF NOT EXISTS quiz_feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    rating integer CHECK (rating >= 1 AND rating <= 5),
    comment text,
    is_public boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    helpful_count integer DEFAULT 0,
    reply_to_id uuid REFERENCES quiz_feedback(id) ON DELETE CASCADE,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ===============================================
-- 10. NOTIFICATION SYSTEM
-- ===============================================

CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title varchar(255) NOT NULL,
    message text,
    notification_type varchar(50) NOT NULL,
    related_entity_id uuid,
    related_entity_type varchar(50),
    is_read boolean DEFAULT false,
    action_url varchar(500),
    priority varchar(20) DEFAULT 'normal', -- low, normal, high, urgent
    delivery_method varchar(20)[] DEFAULT '{"in_app"}', -- in_app, email, push
    scheduled_for timestamp with time zone DEFAULT now(),
    sent_at timestamp with time zone,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now()
);

-- ===============================================
-- 11. ENHANCED INDEXES FOR PERFORMANCE
-- ===============================================

-- Quiz attempts indexes
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created_at ON quiz_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_score ON quiz_attempts(score);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_passed ON quiz_attempts(passed);

-- Question attempts indexes
CREATE INDEX IF NOT EXISTS idx_question_attempts_quiz_attempt_id ON question_attempts(quiz_attempt_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_question_id ON question_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_is_correct ON question_attempts(is_correct);
CREATE INDEX IF NOT EXISTS idx_question_attempts_created_at ON question_attempts(created_at);

-- Media library indexes
CREATE INDEX IF NOT EXISTS idx_media_library_file_type ON media_library(file_type);
CREATE INDEX IF NOT EXISTS idx_media_library_created_by ON media_library(created_by);
CREATE INDEX IF NOT EXISTS idx_media_library_tags ON media_library USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_media_library_created_at ON media_library(created_at);

-- User stats indexes
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_points ON user_stats(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_current_streak ON user_stats(current_streak DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ===============================================
-- 12. VIEWS FOR COMMON QUERIES
-- ===============================================

-- Quiz statistics view
CREATE OR REPLACE VIEW quiz_statistics AS
SELECT 
    q.id,
    q.title,
    q.category,
    q.difficulty,
    COUNT(DISTINCT qa.id) as total_attempts,
    COUNT(DISTINCT qa.user_id) as unique_users,
    ROUND(AVG(qa.score), 2) as average_score,
    ROUND(AVG(qa.time_taken_seconds), 0) as average_time_seconds,
    COUNT(CASE WHEN qa.passed THEN 1 END) as passed_attempts,
    ROUND(
        COUNT(CASE WHEN qa.passed THEN 1 END) * 100.0 / NULLIF(COUNT(qa.id), 0), 
        2
    ) as pass_rate,
    MAX(qa.created_at) as last_attempt_date,
    q.created_at,
    q.is_published
FROM quizzes q
LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
GROUP BY q.id, q.title, q.category, q.difficulty, q.created_at, q.is_published;

-- User performance view
CREATE OR REPLACE VIEW user_performance AS
SELECT 
    u.id as user_id,
    u.email,
    COALESCE(us.total_points, 0) as total_points,
    COALESCE(us.current_streak, 0) as current_streak,
    COALESCE(us.quizzes_completed, 0) as quizzes_completed,
    COALESCE(us.questions_answered, 0) as questions_answered,
    COALESCE(us.correct_answers, 0) as correct_answers,
    CASE 
        WHEN us.questions_answered > 0 
        THEN ROUND(us.correct_answers * 100.0 / us.questions_answered, 2)
        ELSE 0
    END as accuracy_percentage,
    COUNT(DISTINCT ub.badge_id) as badges_earned,
    us.last_activity_date,
    us.created_at as stats_created_at
FROM auth.users u
LEFT JOIN user_stats us ON u.id = us.user_id
LEFT JOIN user_badges ub ON u.id = ub.user_id
GROUP BY u.id, u.email, us.total_points, us.current_streak, us.quizzes_completed, 
         us.questions_answered, us.correct_answers, us.last_activity_date, us.created_at;

-- Question difficulty analysis view
CREATE OR REPLACE VIEW question_difficulty_analysis AS
SELECT 
    qq.id,
    qq.quiz_id,
    qq.question,
    qq.question_type,
    qq.difficulty_level,
    qq.points,
    COUNT(qat.id) as total_attempts,
    COUNT(CASE WHEN qat.is_correct THEN 1 END) as correct_attempts,
    ROUND(
        COUNT(CASE WHEN qat.is_correct THEN 1 END) * 100.0 / NULLIF(COUNT(qat.id), 0), 
        2
    ) as success_rate,
    ROUND(AVG(qat.time_spent_seconds), 2) as avg_time_seconds,
    ROUND(AVG(qat.points_earned), 2) as avg_points_earned
FROM quiz_questions qq
LEFT JOIN question_attempts qat ON qq.id = qat.question_id
GROUP BY qq.id, qq.quiz_id, qq.question, qq.question_type, qq.difficulty_level, qq.points;

-- ===============================================
-- 13. FUNCTIONS FOR COMMON OPERATIONS
-- ===============================================

-- Function to calculate user level based on experience points
CREATE OR REPLACE FUNCTION calculate_user_level(experience_points integer)
RETURNS integer AS $$
BEGIN
    -- Simple level calculation: Level = sqrt(XP/100)
    RETURN GREATEST(1, FLOOR(SQRT(experience_points / 100.0))::integer);
END;
$$ LANGUAGE plpgsql;

-- Function to award badges automatically
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS trigger AS $$
DECLARE
    badge_record RECORD;
BEGIN
    -- This would contain logic to check badge criteria and award them
    -- For now, just a placeholder
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update question analytics
CREATE OR REPLACE FUNCTION update_question_analytics()
RETURNS trigger AS $$
BEGIN
    INSERT INTO question_analytics (
        question_id,
        total_attempts,
        correct_attempts,
        average_time_seconds,
        last_updated
    )
    SELECT 
        NEW.question_id,
        COUNT(*),
        COUNT(CASE WHEN is_correct THEN 1 END),
        AVG(time_spent_seconds),
        now()
    FROM question_attempts 
    WHERE question_id = NEW.question_id
    ON CONFLICT (question_id) 
    DO UPDATE SET
        total_attempts = EXCLUDED.total_attempts,
        correct_attempts = EXCLUDED.correct_attempts,
        average_time_seconds = EXCLUDED.average_time_seconds,
        last_updated = EXCLUDED.last_updated;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 14. TRIGGERS
-- ===============================================

-- Update question analytics when question attempts change
CREATE TRIGGER trigger_update_question_analytics
    AFTER INSERT OR UPDATE ON question_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_question_analytics();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to tables with updated_at columns
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trigger_update_%s_updated_at ON %s', t, t);
        EXECUTE format('CREATE TRIGGER trigger_update_%s_updated_at 
                       BEFORE UPDATE ON %s 
                       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- ===============================================
-- 15. SEED DATA FOR ENHANCED FEATURES
-- ===============================================

-- Insert default badges
INSERT INTO badges (name, description, criteria, points, rarity, category, icon_url) VALUES
('First Quiz', 'Complete your first quiz', '{"quiz_attempts": 1}', 10, 'common', 'achievement', '/badges/first-quiz.svg'),
('Perfect Score', 'Get 100% on any quiz', '{"perfect_scores": 1}', 50, 'rare', 'performance', '/badges/perfect-score.svg'),
('Speed Demon', 'Complete a quiz in under 2 minutes', '{"fast_completion": "120"}', 25, 'rare', 'speed', '/badges/speed-demon.svg'),
('Streak Master', 'Maintain a 7-day streak', '{"daily_streak": 7}', 100, 'epic', 'consistency', '/badges/streak-master.svg'),
('Knowledge Seeker', 'Complete 10 quizzes', '{"quiz_attempts": 10}', 75, 'rare', 'achievement', '/badges/knowledge-seeker.svg'),
('Quiz Creator', 'Create your first quiz', '{"quizzes_created": 1}', 30, 'common', 'creation', '/badges/quiz-creator.svg')
ON CONFLICT (name) DO NOTHING;

-- Insert default learning paths
INSERT INTO learning_paths (name, description, difficulty_level, estimated_hours, completion_criteria) VALUES
('Basic English Assessment', 'Fundamental English language skills assessment', 'beginner', 2, '{"pass_rate": 0.7, "min_score": 60}'),
('Advanced Grammar Mastery', 'Comprehensive grammar and usage evaluation', 'advanced', 4, '{"pass_rate": 0.8, "min_score": 80}'),
('Business English Certification', 'Professional business communication assessment', 'intermediate', 3, '{"pass_rate": 0.75, "min_score": 75}')
ON CONFLICT DO NOTHING;

-- ===============================================
-- 16. ROW LEVEL SECURITY POLICIES
-- ===============================================

-- Enable RLS on new tables
ALTER TABLE quiz_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE adaptive_quiz_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on your needs)

-- Quiz categories - readable by all authenticated users
CREATE POLICY "Quiz categories are viewable by authenticated users" ON quiz_categories
    FOR SELECT USING (auth.role() = 'authenticated');

-- User stats - users can only see their own stats
CREATE POLICY "Users can view their own stats" ON user_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON user_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- User badges - users can see their own badges
CREATE POLICY "Users can view their own badges" ON user_badges
    FOR SELECT USING (auth.uid() = user_id);

-- Notifications - users can only see their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Quiz feedback - public feedback is viewable by all
CREATE POLICY "Public quiz feedback is viewable by all" ON quiz_feedback
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- Media library - basic access control
CREATE POLICY "Public media is viewable by all" ON media_library
    FOR SELECT USING (is_public = true OR auth.uid() = created_by);

-- Question attempts - users can only see their own attempts
CREATE POLICY "Users can view their own question attempts" ON question_attempts
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM quiz_attempts WHERE id = quiz_attempt_id
        )
    );

-- ===============================================
-- 17. FINAL CLEANUP AND OPTIMIZATION
-- ===============================================

-- Analyze tables for better query planning
ANALYZE quizzes;
ANALYZE quiz_questions;
ANALYZE quiz_attempts;
ANALYZE quiz_categories;
ANALYZE question_attempts;
ANALYZE user_stats;
ANALYZE media_library;

-- Update table statistics
-- Note: pg_stat_reset() requires superuser privileges, skipping

-- ===============================================
-- MIGRATION COMPLETE
-- ===============================================

-- Log successful completion
DO $$ 
BEGIN 
    RAISE NOTICE 'Enhanced quiz system migration completed successfully!';
    RAISE NOTICE 'New features available:';
    RAISE NOTICE '- Advanced question types and media support';
    RAISE NOTICE '- Comprehensive analytics and reporting';
    RAISE NOTICE '- Gamification with badges and leaderboards';
    RAISE NOTICE '- Learning paths and adaptive quizzes';
    RAISE NOTICE '- Collaboration and sharing features';
    RAISE NOTICE '- Enhanced security and performance';
END $$;
