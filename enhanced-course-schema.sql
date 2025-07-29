-- Enhanced Course Features Database Updates
-- Add these columns to your existing courses table

-- Add enhanced fields to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS learning_outcomes TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS prerequisites TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE courses ADD COLUMN IF NOT EXISTS certificate_enabled BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS estimated_completion_time VARCHAR(100);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS difficulty_rating INTEGER DEFAULT 1 CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5);

-- Create course_modules table if it doesn't exist
CREATE TABLE IF NOT EXISTS course_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_lessons table if it doesn't exist
CREATE TABLE IF NOT EXISTS course_lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url VARCHAR(500),
    duration VARCHAR(50),
    order_index INTEGER NOT NULL DEFAULT 0,
    is_preview BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lesson_progress table for tracking student progress
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent INTEGER DEFAULT 0, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Create course_resources table for additional materials
CREATE TABLE IF NOT EXISTS course_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50) NOT NULL, -- 'pdf', 'video', 'audio', 'link', 'document'
    resource_url VARCHAR(500) NOT NULL,
    file_size BIGINT, -- in bytes
    is_downloadable BOOLEAN DEFAULT true,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_order ON course_modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_order ON course_lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_resources_course_id ON course_resources(course_id);

-- Add RLS policies for course_modules
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage course modules" ON course_modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Anyone can read published course modules" ON course_modules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = course_modules.course_id 
            AND courses.is_published = true
        )
    );

-- Add RLS policies for course_lessons
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage course lessons" ON course_lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Anyone can read published course lessons" ON course_lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM course_modules cm
            JOIN courses c ON c.id = cm.course_id
            WHERE cm.id = course_lessons.module_id 
            AND c.is_published = true
        )
    );

CREATE POLICY "Enrolled students can read course lessons" ON course_lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM course_modules cm
            JOIN courses c ON c.id = cm.course_id
            JOIN enrollments e ON e.course_id = c.id
            WHERE cm.id = course_lessons.module_id 
            AND e.user_id = auth.uid()
        )
    );

-- Add RLS policies for lesson_progress
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own lesson progress" ON lesson_progress
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admin can view all lesson progress" ON lesson_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Add RLS policies for course_resources
ALTER TABLE course_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage course resources" ON course_resources
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Anyone can read published course resources" ON course_resources
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = course_resources.course_id 
            AND courses.is_published = true
        )
    );

CREATE POLICY "Enrolled students can read course resources" ON course_resources
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses c
            JOIN enrollments e ON e.course_id = c.id
            WHERE c.id = course_resources.course_id 
            AND e.user_id = auth.uid()
        )
    );

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON course_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON course_lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON lesson_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_resources_updated_at BEFORE UPDATE ON course_resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
-- Uncomment the following to add sample enhanced course data

/*
-- Add sample learning outcomes and prerequisites to existing courses
UPDATE courses SET 
    learning_outcomes = ARRAY[
        'Understand basic English grammar rules',
        'Construct simple sentences confidently',
        'Recognize common grammar patterns'
    ],
    prerequisites = ARRAY[
        'Basic English vocabulary (500+ words)',
        'Ability to read simple English texts'
    ],
    tags = ARRAY['grammar', 'beginner', 'foundation'],
    certificate_enabled = true,
    estimated_completion_time = '4 weeks',
    difficulty_rating = 2
WHERE category = 'grammar' AND level = 'beginner';
*/
