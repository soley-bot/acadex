-- Quiz Data Integrity Constraints
-- Ensures all questions have proper correct answers based on their type

-- Function to validate question data
CREATE OR REPLACE FUNCTION validate_question_correct_answer()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate based on question type
  CASE NEW.question_type
    WHEN 'multiple_choice', 'single_choice', 'true_false' THEN
      -- These types require correct_answer (numeric)
      IF NEW.correct_answer IS NULL THEN
        RAISE EXCEPTION 'Question type % requires correct_answer to be set', NEW.question_type;
      END IF;
      
    WHEN 'fill_blank', 'essay' THEN
      -- These types require correct_answer_text
      IF NEW.correct_answer_text IS NULL OR trim(NEW.correct_answer_text) = '' THEN
        RAISE EXCEPTION 'Question type % requires correct_answer_text to be set', NEW.question_type;
      END IF;
      
    WHEN 'matching', 'ordering' THEN
      -- These types require correct_answer_json
      IF NEW.correct_answer_json IS NULL OR 
         (jsonb_typeof(NEW.correct_answer_json) = 'array' AND jsonb_array_length(NEW.correct_answer_json) = 0) OR
         (jsonb_typeof(NEW.correct_answer_json) = 'object' AND NEW.correct_answer_json = '{}'::jsonb) THEN
        RAISE EXCEPTION 'Question type % requires correct_answer_json to be properly set', NEW.question_type;
      END IF;
      
    ELSE
      RAISE EXCEPTION 'Unknown question_type: %', NEW.question_type;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT and UPDATE
DROP TRIGGER IF EXISTS validate_question_correct_answer_trigger ON quiz_questions;
CREATE TRIGGER validate_question_correct_answer_trigger
  BEFORE INSERT OR UPDATE ON quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION validate_question_correct_answer();

-- Add check constraints for question types
ALTER TABLE quiz_questions 
DROP CONSTRAINT IF EXISTS valid_question_types;

ALTER TABLE quiz_questions 
ADD CONSTRAINT valid_question_types 
CHECK (question_type IN ('multiple_choice', 'single_choice', 'true_false', 'fill_blank', 'essay', 'matching', 'ordering'));

-- Add constraint to ensure questions have text
ALTER TABLE quiz_questions 
DROP CONSTRAINT IF EXISTS question_not_empty;

ALTER TABLE quiz_questions 
ADD CONSTRAINT question_not_empty 
CHECK (trim(question) != '');

-- Add constraint to ensure options are properly formatted
ALTER TABLE quiz_questions 
DROP CONSTRAINT IF EXISTS valid_options_format;

ALTER TABLE quiz_questions 
ADD CONSTRAINT valid_options_format 
CHECK (
  CASE question_type
    WHEN 'multiple_choice', 'single_choice' THEN 
      jsonb_typeof(options) = 'array' AND jsonb_array_length(options) >= 2
    WHEN 'true_false' THEN 
      options = '["True", "False"]'::jsonb
    WHEN 'matching' THEN 
      jsonb_typeof(options) = 'array' AND jsonb_array_length(options) >= 2
    WHEN 'ordering' THEN 
      jsonb_typeof(options) = 'array' AND jsonb_array_length(options) >= 2
    WHEN 'fill_blank', 'essay' THEN 
      options IS NULL OR options = '[]'::jsonb
    ELSE true
  END
);

-- Create index for better performance on question type queries
CREATE INDEX IF NOT EXISTS idx_quiz_questions_type ON quiz_questions(question_type);

-- Add comments for documentation
COMMENT ON CONSTRAINT valid_question_types ON quiz_questions IS 'Ensures only supported question types are used';
COMMENT ON CONSTRAINT question_not_empty ON quiz_questions IS 'Ensures questions have non-empty text';
COMMENT ON CONSTRAINT valid_options_format ON quiz_questions IS 'Ensures options are properly formatted for each question type';
COMMENT ON FUNCTION validate_question_correct_answer() IS 'Validates that correct answers are properly set based on question type';

-- Display current statistics
SELECT 
  question_type,
  COUNT(*) as total_questions,
  COUNT(CASE WHEN correct_answer IS NOT NULL THEN 1 END) as with_correct_answer,
  COUNT(CASE WHEN correct_answer_text IS NOT NULL AND trim(correct_answer_text) != '' THEN 1 END) as with_correct_answer_text,
  COUNT(CASE WHEN correct_answer_json IS NOT NULL AND correct_answer_json != '[]'::jsonb AND correct_answer_json != '{}'::jsonb THEN 1 END) as with_correct_answer_json
FROM quiz_questions 
GROUP BY question_type
ORDER BY question_type;
