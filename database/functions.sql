-- Function to increment course student count
CREATE OR REPLACE FUNCTION increment_student_count(course_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.courses 
  SET student_count = student_count + 1,
      updated_at = NOW()
  WHERE id = course_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement course student count
CREATE OR REPLACE FUNCTION decrement_student_count(course_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.courses 
  SET student_count = GREATEST(0, student_count - 1),
      updated_at = NOW()
  WHERE id = course_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update quiz total questions count
CREATE OR REPLACE FUNCTION update_quiz_question_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.quizzes 
    SET total_questions = total_questions + 1,
        updated_at = NOW()
    WHERE id = NEW.quiz_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.quizzes 
    SET total_questions = GREATEST(0, total_questions - 1),
        updated_at = NOW()
    WHERE id = OLD.quiz_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for quiz question count
CREATE TRIGGER trigger_update_quiz_question_count_insert
  AFTER INSERT ON public.quiz_questions
  FOR EACH ROW EXECUTE FUNCTION update_quiz_question_count();

CREATE TRIGGER trigger_update_quiz_question_count_delete
  AFTER DELETE ON public.quiz_questions
  FOR EACH ROW EXECUTE FUNCTION update_quiz_question_count();

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE(
  total_courses INTEGER,
  completed_courses INTEGER,
  total_quizzes INTEGER,
  avg_quiz_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM public.enrollments WHERE user_id = user_uuid) as total_courses,
    (SELECT COUNT(*)::INTEGER FROM public.enrollments WHERE user_id = user_uuid AND completed_at IS NOT NULL) as completed_courses,
    (SELECT COUNT(*)::INTEGER FROM public.quiz_attempts WHERE user_id = user_uuid) as total_quizzes,
    (SELECT COALESCE(AVG(score::DECIMAL / total_questions * 100), 0) FROM public.quiz_attempts WHERE user_id = user_uuid) as avg_quiz_score;
END;
$$ LANGUAGE plpgsql;
