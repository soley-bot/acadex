-- Question Templates System
-- This schema adds support for reusable question templates that instructors can use to quickly create questions

-- Question templates table
CREATE TABLE IF NOT EXISTS question_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'essay', 'matching', 'ordering')),
  difficulty_level VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  
  -- Template content (JSON structure varies by question type)
  template_data JSONB NOT NULL,
  
  -- Metadata
  language VARCHAR(10) DEFAULT 'english',
  subject_area VARCHAR(100),
  tags TEXT[], -- Array of tags for filtering
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Ownership
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false, -- Public templates can be used by all instructors
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_question_templates_category ON question_templates(category);
CREATE INDEX IF NOT EXISTS idx_question_templates_type ON question_templates(question_type);
CREATE INDEX IF NOT EXISTS idx_question_templates_difficulty ON question_templates(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_question_templates_language ON question_templates(language);
CREATE INDEX IF NOT EXISTS idx_question_templates_subject ON question_templates(subject_area);
CREATE INDEX IF NOT EXISTS idx_question_templates_tags ON question_templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_question_templates_public ON question_templates(is_public, is_active);
CREATE INDEX IF NOT EXISTS idx_question_templates_featured ON question_templates(is_featured, is_active);
CREATE INDEX IF NOT EXISTS idx_question_templates_created_by ON question_templates(created_by);

-- RLS Policies
ALTER TABLE question_templates ENABLE ROW LEVEL SECURITY;

-- Users can read public templates and their own templates
CREATE POLICY "Users can view public and own question templates" ON question_templates
  FOR SELECT USING (
    is_public = true AND is_active = true 
    OR 
    created_by = auth.uid()
  );

-- Users can create their own templates
CREATE POLICY "Users can create question templates" ON question_templates
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Users can update their own templates
CREATE POLICY "Users can update own question templates" ON question_templates
  FOR UPDATE USING (created_by = auth.uid());

-- Users can delete their own templates
CREATE POLICY "Users can delete own question templates" ON question_templates
  FOR DELETE USING (created_by = auth.uid());

-- Admin policies
CREATE POLICY "Admins can manage all question templates" ON question_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Function to update template usage count
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE question_templates 
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get popular templates
CREATE OR REPLACE FUNCTION get_popular_templates(
  limit_count INTEGER DEFAULT 10,
  category_filter VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  description TEXT,
  category VARCHAR,
  question_type VARCHAR,
  difficulty_level VARCHAR,
  usage_count INTEGER,
  is_featured BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.description,
    t.category,
    t.question_type,
    t.difficulty_level,
    t.usage_count,
    t.is_featured
  FROM question_templates t
  WHERE t.is_active = true 
    AND t.is_public = true
    AND (category_filter IS NULL OR t.category = category_filter)
  ORDER BY 
    t.is_featured DESC,
    t.usage_count DESC,
    t.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_question_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_question_templates_updated_at
  BEFORE UPDATE ON question_templates
  FOR EACH ROW EXECUTE FUNCTION update_question_template_updated_at();

-- Insert some default templates for common English learning scenarios
INSERT INTO question_templates (title, description, category, question_type, difficulty_level, template_data, language, subject_area, tags, is_public, is_featured, created_by) VALUES

-- Multiple Choice Templates
(
  'Grammar: Verb Tense Selection',
  'Template for testing verb tense understanding with contextual sentences',
  'english-grammar',
  'multiple_choice',
  'medium',
  '{
    "question_pattern": "Choose the correct verb tense for the sentence: \"{sentence}\"",
    "options_pattern": [
      "{correct_verb}",
      "{incorrect_verb_1}",
      "{incorrect_verb_2}",
      "{incorrect_verb_3}"
    ],
    "explanation_pattern": "The correct answer is \"{correct_verb}\" because {explanation_reason}.",
    "variables": {
      "sentence": "She ____ to the store yesterday",
      "correct_verb": "went",
      "incorrect_verb_1": "go",
      "incorrect_verb_2": "going",
      "incorrect_verb_3": "goes",
      "explanation_reason": "we use past tense for actions completed in the past"
    }
  }',
  'english',
  'Grammar',
  ARRAY['grammar', 'verb-tenses', 'multiple-choice'],
  true,
  true,
  (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1)
),

(
  'Vocabulary: Synonym Selection',
  'Template for testing vocabulary knowledge through synonym identification',
  'english-vocabulary',
  'multiple_choice',
  'easy',
  '{
    "question_pattern": "Which word is closest in meaning to \"{target_word}\"?",
    "options_pattern": [
      "{correct_synonym}",
      "{incorrect_option_1}",
      "{incorrect_option_2}",
      "{incorrect_option_3}"
    ],
    "explanation_pattern": "\"{correct_synonym}\" is the best synonym for \"{target_word}\" as both words {explanation_reason}.",
    "variables": {
      "target_word": "happy",
      "correct_synonym": "joyful",
      "incorrect_option_1": "sad",
      "incorrect_option_2": "angry",
      "incorrect_option_3": "tired",
      "explanation_reason": "express positive emotions and contentment"
    }
  }',
  'english',
  'Vocabulary',
  ARRAY['vocabulary', 'synonyms', 'word-meaning'],
  true,
  true,
  (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1)
),

-- True/False Templates
(
  'Reading Comprehension: Statement Verification',
  'Template for testing reading comprehension with true/false questions',
  'english-reading',
  'true_false',
  'medium',
  '{
    "question_pattern": "Based on the passage, the following statement is true or false: \"{statement}\"",
    "context_pattern": "{reading_passage}",
    "explanation_pattern": "This statement is {correct_answer} because {explanation_reason}.",
    "variables": {
      "reading_passage": "The ancient city of Rome was built on seven hills and became the center of a vast empire.",
      "statement": "Rome was constructed on multiple hills",
      "correct_answer": "true",
      "explanation_reason": "the passage explicitly states Rome was built on seven hills"
    }
  }',
  'english',
  'Reading Comprehension',
  ARRAY['reading', 'comprehension', 'true-false'],
  true,
  true,
  (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1)
),

-- Fill in the Blank Templates
(
  'Grammar: Article Usage',
  'Template for testing article (a, an, the) usage in sentences',
  'english-grammar',
  'fill_blank',
  'easy',
  '{
    "question_pattern": "Fill in the blank with the correct article: \"{sentence_with_blank}\"",
    "blank_pattern": "______",
    "explanation_pattern": "The correct article is \"{correct_answer}\" because {explanation_reason}.",
    "variables": {
      "sentence_with_blank": "She is ___ honest person who always tells the truth.",
      "correct_answer": "an",
      "explanation_reason": "we use \"an\" before words that begin with a vowel sound"
    }
  }',
  'english',
  'Grammar',
  ARRAY['grammar', 'articles', 'fill-blank'],
  true,
  true,
  (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1)
),

-- Essay Templates
(
  'Opinion Essay: Personal Viewpoint',
  'Template for structured opinion essay questions',
  'english-writing',
  'essay',
  'hard',
  '{
    "question_pattern": "Write a {word_count}-word essay expressing your opinion on: \"{topic}\". Include specific examples and reasons to support your viewpoint.",
    "rubric_pattern": {
      "content": "Clear thesis statement and supporting arguments",
      "organization": "Logical structure with introduction, body, and conclusion",
      "language": "Appropriate vocabulary and varied sentence structures",
      "mechanics": "Correct grammar, spelling, and punctuation"
    },
    "variables": {
      "topic": "The impact of social media on modern communication",
      "word_count": "300-400"
    }
  }',
  'english',
  'Writing',
  ARRAY['writing', 'essay', 'opinion', 'critical-thinking'],
  true,
  true,
  (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1)
),

-- Business English Templates
(
  'Business Communication: Email Etiquette',
  'Template for testing professional email communication skills',
  'english-speaking',
  'multiple_choice',
  'medium',
  '{
    "question_pattern": "In a professional email to your supervisor, which greeting is most appropriate?",
    "options_pattern": [
      "Dear {supervisor_title} {last_name},",
      "Hey {first_name}!",
      "Hi there,",
      "What''s up {first_name}?"
    ],
    "explanation_pattern": "In professional communication, formal greetings like \"{correct_answer}\" maintain appropriate business etiquette.",
    "variables": {
      "supervisor_title": "Mr.",
      "last_name": "Johnson",
      "first_name": "Mike",
      "correct_answer": "Dear Mr. Johnson,"
    }
  }',
  'english',
  'Business English',
  ARRAY['business', 'communication', 'email', 'professional'],
  true,
  false,
  (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1)
);

-- Grant permissions for the increment function
GRANT EXECUTE ON FUNCTION increment_template_usage TO authenticated;
GRANT EXECUTE ON FUNCTION get_popular_templates TO authenticated;