-- Categories Management System
-- Create categories table for both quizzes and courses

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6366f1', -- Hex color code
  icon VARCHAR(50), -- Icon name for UI
  type VARCHAR(20) DEFAULT 'general' CHECK (type IN ('general', 'quiz', 'course')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active categories
CREATE POLICY "Anyone can read active categories" ON categories
  FOR SELECT USING (is_active = true);

-- Policy: Only admins can manage categories
CREATE POLICY "Only admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Update trigger for categories
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_categories_updated_at();

-- Insert default categories
INSERT INTO categories (name, description, color, icon, type) VALUES
  ('English', 'General English language learning', '#3b82f6', 'book', 'general'),
  ('Grammar', 'English grammar and syntax', '#10b981', 'edit', 'general'),
  ('Vocabulary', 'Word learning and usage', '#f59e0b', 'bookmark', 'general'),
  ('Pronunciation', 'Speaking and pronunciation', '#ef4444', 'mic', 'general'),
  ('Writing', 'Written communication skills', '#8b5cf6', 'pen-tool', 'general'),
  ('Reading', 'Reading comprehension', '#06b6d4', 'book-open', 'general'),
  ('Listening', 'Listening comprehension', '#84cc16', 'headphones', 'general'),
  ('Speaking', 'Oral communication', '#f97316', 'message-circle', 'general'),
  ('Business English', 'Professional English skills', '#6366f1', 'briefcase', 'general'),
  ('Academic English', 'Academic writing and research', '#ec4899', 'graduation-cap', 'general');

-- Update quizzes table to reference categories (if not already done)
-- ALTER TABLE quizzes ADD COLUMN category_id UUID REFERENCES categories(id);
-- ALTER TABLE courses ADD COLUMN category_id UUID REFERENCES categories(id);
