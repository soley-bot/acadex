-- =====================================================
-- UNIFIED CATEGORY SYSTEM MIGRATION
-- Phase 1: Create New Category Architecture
-- =====================================================

-- Drop old unused tables
DROP TABLE IF EXISTS public.quiz_categories CASCADE;

-- Create subjects table (top-level organization)
CREATE TABLE IF NOT EXISTS public.subjects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    slug varchar(255) UNIQUE NOT NULL,
    description text,
    icon varchar(100),
    color varchar(7) DEFAULT '#6366f1',
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create enhanced categories table (replacing the old one)
DROP TABLE IF EXISTS public.categories CASCADE;
CREATE TABLE public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
    parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    slug varchar(255) NOT NULL,
    description text,
    color varchar(7) DEFAULT '#6366f1',
    icon varchar(100),
    level integer DEFAULT 1, -- 1=top level, 2=subcategory, etc
    sort_order integer DEFAULT 0,
    metadata jsonb DEFAULT '{}',
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    
    -- Ensure unique slug per subject
    UNIQUE(subject_id, slug),
    -- Prevent infinite recursion
    CHECK (id != parent_id)
);

-- Create content-category relationships table
CREATE TABLE public.content_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id uuid NOT NULL,
    category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
    content_type varchar(50) NOT NULL, -- 'course', 'quiz', 'lesson', 'article'
    is_primary boolean DEFAULT false, -- One main category per content
    created_at timestamp with time zone DEFAULT now(),
    
    -- Ensure no duplicate relationships
    UNIQUE(content_id, category_id, content_type),
    -- Validate content types
    CHECK (content_type IN ('course', 'quiz', 'lesson', 'article', 'video', 'podcast'))
);

-- Create indexes for performance
CREATE INDEX idx_categories_subject_id ON categories(subject_id);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_content_categories_content ON content_categories(content_id, content_type);
CREATE INDEX idx_content_categories_category ON content_categories(category_id);
CREATE INDEX idx_content_categories_primary ON content_categories(content_type, is_primary) WHERE is_primary = true;

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default subject (English Learning)
INSERT INTO subjects (name, slug, description, icon, color, sort_order) VALUES
('English Learning', 'english-learning', 'English language courses and assessments', 'book-open', '#3b82f6', 1);

-- Get the subject ID for categories
DO $$
DECLARE 
    english_subject_id uuid;
BEGIN
    SELECT id INTO english_subject_id FROM subjects WHERE slug = 'english-learning';
    
    -- Insert core categories based on existing data
    INSERT INTO categories (subject_id, name, slug, description, color, icon, level, sort_order) VALUES
    (english_subject_id, 'Grammar', 'grammar', 'English grammar rules and structures', '#10b981', 'type', 1, 1),
    (english_subject_id, 'Vocabulary', 'vocabulary', 'Word learning and usage', '#f59e0b', 'book', 1, 2),
    (english_subject_id, 'Pronunciation', 'pronunciation', 'Speech and pronunciation practice', '#ef4444', 'mic', 1, 3),
    (english_subject_id, 'Speaking', 'speaking', 'Conversational English skills', '#8b5cf6', 'message-circle', 1, 4),
    (english_subject_id, 'Writing', 'writing', 'Written communication skills', '#06b6d4', 'pen-tool', 1, 5),
    (english_subject_id, 'Business English', 'business-english', 'Professional workplace English', '#84cc16', 'briefcase', 1, 6),
    (english_subject_id, 'Literature', 'literature', 'English literature and analysis', '#ec4899', 'book-open', 1, 7),
    (english_subject_id, 'Test Preparation', 'test-preparation', 'IELTS, TOEFL, and other exam prep', '#64748b', 'award', 1, 8);
END $$;

-- Create materialized view for category hierarchy (performance optimization)
CREATE MATERIALIZED VIEW category_hierarchy AS
WITH RECURSIVE category_tree AS (
    -- Base case: top-level categories
    SELECT 
        id,
        subject_id,
        parent_id,
        name,
        slug,
        level,
        ARRAY[name::varchar] as path,
        name::varchar as full_path
    FROM categories 
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- Recursive case: child categories
    SELECT 
        c.id,
        c.subject_id,
        c.parent_id,
        c.name,
        c.slug,
        c.level,
        ct.path || c.name::varchar,
        ct.full_path || ' > ' || c.name::varchar
    FROM categories c
    INNER JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree;

-- Create index on materialized view
CREATE INDEX idx_category_hierarchy_subject ON category_hierarchy(subject_id);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_category_hierarchy()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW category_hierarchy;
END;
$$ LANGUAGE plpgsql;