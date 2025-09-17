-- =====================================================
-- DATA MIGRATION: Populate new category system
-- Extract existing categories from courses.category and quizzes.category
-- =====================================================

-- Migrate existing course categories to content_categories
DO $$
DECLARE 
    course_record RECORD;
    found_category_id uuid;
    english_subject_id uuid;
BEGIN
    -- Get English Learning subject ID
    SELECT id INTO english_subject_id FROM subjects WHERE slug = 'english-learning';
    
    -- Loop through all courses and create category relationships
    FOR course_record IN 
        SELECT id, category FROM courses WHERE category IS NOT NULL AND category != ''
    LOOP
        -- Find matching category ID (case insensitive)
        SELECT c.id INTO found_category_id 
        FROM categories c 
        WHERE c.subject_id = english_subject_id 
        AND LOWER(c.name) = LOWER(course_record.category);
        
        -- If category found, create relationship
        IF found_category_id IS NOT NULL THEN
            INSERT INTO content_categories (content_id, category_id, content_type, is_primary)
            VALUES (course_record.id, found_category_id, 'course', true)
            ON CONFLICT (content_id, category_id, content_type) DO NOTHING;
            
            RAISE NOTICE 'Migrated course % to category %', course_record.id, course_record.category;
        ELSE
            RAISE WARNING 'Category not found for course %: %', course_record.id, course_record.category;
        END IF;
    END LOOP;
END $$;

-- Migrate existing quiz categories to content_categories  
DO $$
DECLARE 
    quiz_record RECORD;
    found_category_id uuid;
    english_subject_id uuid;
BEGIN
    -- Get English Learning subject ID
    SELECT id INTO english_subject_id FROM subjects WHERE slug = 'english-learning';
    
    -- Loop through all quizzes and create category relationships
    FOR quiz_record IN 
        SELECT id, category FROM quizzes WHERE category IS NOT NULL AND category != ''
    LOOP
        -- Find matching category ID (case insensitive)
        SELECT c.id INTO found_category_id 
        FROM categories c 
        WHERE c.subject_id = english_subject_id 
        AND LOWER(c.name) = LOWER(quiz_record.category);
        
        -- If category found, create relationship
        IF found_category_id IS NOT NULL THEN
            INSERT INTO content_categories (content_id, category_id, content_type, is_primary)
            VALUES (quiz_record.id, found_category_id, 'quiz', true)
            ON CONFLICT (content_id, category_id, content_type) DO NOTHING;
            
            RAISE NOTICE 'Migrated quiz % to category %', quiz_record.id, quiz_record.category;
        ELSE
            RAISE WARNING 'Category not found for quiz %: %', quiz_record.id, quiz_record.category;
        END IF;
    END LOOP;
END $$;

-- Create any missing categories that were found in the data
DO $$
DECLARE 
    missing_category varchar;
    english_subject_id uuid;
    max_sort_order integer;
BEGIN
    SELECT id INTO english_subject_id FROM subjects WHERE slug = 'english-learning';
    SELECT COALESCE(MAX(sort_order), 0) INTO max_sort_order FROM categories WHERE subject_id = english_subject_id;
    
    -- Find categories in courses that don't exist in categories table
    FOR missing_category IN 
        SELECT DISTINCT category 
        FROM courses 
        WHERE category IS NOT NULL 
        AND category != ''
        AND NOT EXISTS (
            SELECT 1 FROM categories c 
            WHERE c.subject_id = english_subject_id 
            AND LOWER(c.name) = LOWER(category)
        )
    LOOP
        max_sort_order := max_sort_order + 1;
        INSERT INTO categories (subject_id, name, slug, description, level, sort_order) VALUES
        (
            english_subject_id, 
            missing_category, 
            LOWER(REPLACE(missing_category, ' ', '-')), 
            'Auto-migrated from existing course data',
            1,
            max_sort_order
        );
        RAISE NOTICE 'Created missing category from courses: %', missing_category;
    END LOOP;
    
    -- Find categories in quizzes that don't exist in categories table
    FOR missing_category IN 
        SELECT DISTINCT category 
        FROM quizzes 
        WHERE category IS NOT NULL 
        AND category != ''
        AND NOT EXISTS (
            SELECT 1 FROM categories c 
            WHERE c.subject_id = english_subject_id 
            AND LOWER(c.name) = LOWER(category)
        )
    LOOP
        max_sort_order := max_sort_order + 1;
        INSERT INTO categories (subject_id, name, slug, description, level, sort_order) VALUES
        (
            english_subject_id, 
            missing_category, 
            LOWER(REPLACE(missing_category, ' ', '-')), 
            'Auto-migrated from existing quiz data',
            1,
            max_sort_order
        );
        RAISE NOTICE 'Created missing category from quizzes: %', missing_category;
    END LOOP;
END $$;

-- Refresh materialized view
SELECT refresh_category_hierarchy();

-- Validation queries
SELECT 'MIGRATION SUMMARY' as info;

SELECT 
    'Total Subjects:' as metric,
    COUNT(*) as count
FROM subjects;

SELECT 
    'Total Categories:' as metric,
    COUNT(*) as count
FROM categories;

SELECT 
    'Course-Category Relationships:' as metric,
    COUNT(*) as count
FROM content_categories WHERE content_type = 'course';

SELECT 
    'Quiz-Category Relationships:' as metric,
    COUNT(*) as count
FROM content_categories WHERE content_type = 'quiz';

-- Show categories with content counts
SELECT 
    c.name as category_name,
    COUNT(CASE WHEN cc.content_type = 'course' THEN 1 END) as courses,
    COUNT(CASE WHEN cc.content_type = 'quiz' THEN 1 END) as quizzes,
    COUNT(*) as total_content
FROM categories c
LEFT JOIN content_categories cc ON c.id = cc.category_id
GROUP BY c.id, c.name, c.sort_order
ORDER BY c.sort_order;

-- Show any unmigrated content
SELECT 'Unmigrated Courses:' as info, COUNT(*) as count
FROM courses 
WHERE category IS NOT NULL 
AND category != ''
AND id NOT IN (
    SELECT content_id FROM content_categories WHERE content_type = 'course'
);

SELECT 'Unmigrated Quizzes:' as info, COUNT(*) as count
FROM quizzes 
WHERE category IS NOT NULL 
AND category != ''
AND id NOT IN (
    SELECT content_id FROM content_categories WHERE content_type = 'quiz'
);