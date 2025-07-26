-- CHUNK 4: Functions and Triggers
-- Run this after tables and constraints are set up

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE OR REPLACE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_courses_updated_at 
  BEFORE UPDATE ON public.courses 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate quiz score
CREATE OR REPLACE FUNCTION public.calculate_quiz_score(
  p_quiz_id UUID,
  p_user_answers JSONB
) RETURNS INTEGER AS $$
DECLARE
  total_score INTEGER := 0;
  max_score INTEGER := 0;
  question RECORD;
  user_answer TEXT;
BEGIN
  FOR question IN 
    SELECT id, correct_answer, points 
    FROM public.questions 
    WHERE quiz_id = p_quiz_id
  LOOP
    max_score := max_score + question.points;
    user_answer := p_user_answers->>question.id::text;
    
    IF user_answer = question.correct_answer THEN
      total_score := total_score + question.points;
    END IF;
  END LOOP;
  
  -- Return percentage score
  IF max_score > 0 THEN
    RETURN (total_score * 100) / max_score;
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify functions were created
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('handle_new_user', 'update_updated_at_column', 'calculate_quiz_score')
ORDER BY routine_name;
