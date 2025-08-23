-- Content Review System Database Schema
-- Store AI-generated content review results for tracking and dashboard

-- Content Review Items Table
CREATE TABLE IF NOT EXISTS content_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content identification
  content_type VARCHAR(50) NOT NULL, -- 'quiz', 'lesson', 'course', etc.
  content_id UUID, -- Reference to the actual content (quiz_id, etc.)
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- AI Generation details
  generated_by_ai BOOLEAN DEFAULT true,
  ai_model VARCHAR(100), -- 'gemini-2.5-pro', etc.
  generation_prompt TEXT,
  raw_ai_response TEXT,
  
  -- Review status and priority
  review_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'approved', 'rejected', 'needs_revision'
  priority VARCHAR(10) DEFAULT 'medium', -- 'high', 'medium', 'low'
  
  -- AI Assessment scores
  ai_confidence_score DECIMAL(3,2) DEFAULT 0.00, -- 0.00 to 1.00 (our confidence score / 100)
  quality_score DECIMAL(3,2), -- Manual quality score assigned by reviewers
  
  -- Review details
  validation_issues JSONB DEFAULT '[]'::jsonb, -- Array of ValidationIssue objects
  reviewer_notes TEXT,
  auto_corrected BOOLEAN DEFAULT false,
  corrected_content TEXT,
  
  -- Metadata
  language VARCHAR(20) DEFAULT 'english',
  subject VARCHAR(100),
  difficulty VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'
  estimated_review_time INTEGER DEFAULT 10, -- minutes
  actual_review_time INTEGER, -- minutes taken for review
  
  -- User tracking
  created_by UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_content_reviews_status ON content_reviews(review_status);
CREATE INDEX IF NOT EXISTS idx_content_reviews_priority ON content_reviews(priority);
CREATE INDEX IF NOT EXISTS idx_content_reviews_confidence ON content_reviews(ai_confidence_score);
CREATE INDEX IF NOT EXISTS idx_content_reviews_created_at ON content_reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_content_reviews_type ON content_reviews(content_type);
CREATE INDEX IF NOT EXISTS idx_content_reviews_subject ON content_reviews(subject);

-- Row Level Security
ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin users can view all content reviews" ON content_reviews;
DROP POLICY IF EXISTS "Admin users can insert content reviews" ON content_reviews;
DROP POLICY IF EXISTS "Admin users can update content reviews" ON content_reviews;

-- Policies for admin access
CREATE POLICY "Admin users can view all content reviews" ON content_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.role = 'admin'
    )
  );

CREATE POLICY "Admin users can insert content reviews" ON content_reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "Admin users can update content reviews" ON content_reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_content_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_content_reviews_updated_at ON content_reviews;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_content_reviews_updated_at
  BEFORE UPDATE ON content_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_content_reviews_updated_at();

-- Review Statistics View for dashboard
CREATE OR REPLACE VIEW content_review_stats AS
SELECT 
  COUNT(CASE WHEN review_status = 'pending' THEN 1 END) as needs_review,
  COUNT(CASE WHEN review_status = 'in_progress' THEN 1 END) as in_progress,
  COUNT(CASE WHEN DATE(approved_at) = CURRENT_DATE THEN 1 END) as approved_today,
  ROUND(AVG(actual_review_time), 1) as avg_review_time,
  ROUND(AVG(CASE WHEN quality_score IS NOT NULL THEN quality_score END), 2) as avg_quality_score,
  ROUND(AVG(ai_confidence_score), 2) as avg_ai_confidence
FROM content_reviews
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';

-- Priority Queue View (items needing review, ordered by priority and confidence)
CREATE OR REPLACE VIEW priority_review_queue AS
SELECT 
  id,
  content_type,
  title,
  ai_confidence_score,
  priority,
  created_at,
  estimated_review_time,
  subject,
  difficulty,
  language,
  validation_issues,
  -- Calculate priority score (lower = more urgent)
  CASE 
    WHEN priority = 'high' THEN 1
    WHEN priority = 'medium' THEN 2
    ELSE 3
  END + 
  CASE 
    WHEN ai_confidence_score < 0.70 THEN 0
    WHEN ai_confidence_score < 0.85 THEN 1
    ELSE 2
  END as priority_score
FROM content_reviews
WHERE review_status IN ('pending', 'in_progress')
ORDER BY priority_score ASC, created_at ASC;

-- Recent Content Review Activity View
CREATE OR REPLACE VIEW recent_review_activity AS
SELECT 
  id,
  content_type,
  title,
  review_status,
  ai_confidence_score,
  quality_score,
  created_at,
  reviewed_at,
  approved_at,
  actual_review_time,
  reviewed_by
FROM content_reviews
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY COALESCE(approved_at, reviewed_at, created_at) DESC
LIMIT 20;
