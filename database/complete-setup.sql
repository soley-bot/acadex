-- =====================================================
-- ACADEX ENGLISH LEARNING PLATFORM - COMPLETE SETUP
-- =====================================================
-- This script sets up the complete database for the English learning platform
-- Run this entire script in your Supabase SQL Editor
-- =====================================================

-- First, clean up any existing data (optional - remove if you want to keep existing data)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
DROP TRIGGER IF EXISTS update_quizzes_updated_at ON public.quizzes;
DROP TRIGGER IF EXISTS trigger_update_quiz_question_count_insert ON public.quiz_questions;
DROP TRIGGER IF EXISTS trigger_update_quiz_question_count_delete ON public.quiz_questions;

DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS increment_student_count(UUID);
DROP FUNCTION IF EXISTS decrement_student_count(UUID);
DROP FUNCTION IF EXISTS update_quiz_question_count();
DROP FUNCTION IF EXISTS get_user_stats(UUID);

DROP TABLE IF EXISTS public.quiz_questions CASCADE;
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- =====================================================
-- SCHEMA CREATION
-- =====================================================

-- Create Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Courses table
CREATE TABLE public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructor_id UUID REFERENCES public.users(id) NOT NULL,
  instructor_name TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration TEXT NOT NULL,
  image_url TEXT,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  student_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Quizzes table
CREATE TABLE public.quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER NOT NULL DEFAULT 10,
  total_questions INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Quiz Questions table
CREATE TABLE public.quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of options
  correct_answer INTEGER NOT NULL, -- Index of correct option
  explanation TEXT,
  order_index INTEGER NOT NULL,
  UNIQUE(quiz_id, order_index)
);

-- Create Quiz Attempts table
CREATE TABLE public.quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  quiz_id UUID REFERENCES public.quizzes(id) NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL, -- Object with question_id as key and selected_answer_index as value
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Enrollments table
CREATE TABLE public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_courses_category ON public.courses(category);
CREATE INDEX idx_courses_level ON public.courses(level);
CREATE INDEX idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX idx_quizzes_category ON public.quizzes(category);
CREATE INDEX idx_quizzes_difficulty ON public.quizzes(difficulty);
CREATE INDEX idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON public.enrollments(course_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- =====================================================

-- Note: RLS policies are created here but will be enabled after data insertion

-- Create RLS Policies for Users
CREATE POLICY "Users can view profiles" ON public.users
  FOR SELECT USING (auth.uid() = id OR role = 'instructor');

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow user creation" ON public.users
  FOR INSERT WITH CHECK (true);

-- Create RLS Policies for Courses
CREATE POLICY "Anyone can view published courses" ON public.courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Instructors can manage own courses" ON public.courses
  FOR ALL USING (auth.uid() = instructor_id);

-- Create RLS Policies for Quizzes
CREATE POLICY "Anyone can view published quizzes" ON public.quizzes
  FOR SELECT USING (is_published = true);

-- Create RLS Policies for Quiz Questions
CREATE POLICY "Anyone can view questions for published quizzes" ON public.quiz_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quizzes 
      WHERE id = quiz_id AND is_published = true
    )
  );

-- Create RLS Policies for Quiz Attempts
CREATE POLICY "Users can view own quiz attempts" ON public.quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quiz attempts" ON public.quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS Policies for Enrollments
CREATE POLICY "Users can view own enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own enrollments" ON public.enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollment progress" ON public.enrollments
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON public.quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Create a trigger to automatically create user profile when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'student'
  )
  ON CONFLICT (id) DO NOTHING; -- Avoid conflicts if user already exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the user creation trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =====================================================
-- ENGLISH LEARNING SAMPLE DATA
-- =====================================================

-- Insert English Learning Instructors
INSERT INTO public.users (id, email, name, role, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'sarah.johnson@acadex.com', 'Sarah Johnson', 'instructor', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'david.smith@acadex.com', 'David Smith', 'instructor', NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'maria.garcia@acadex.com', 'Maria Garcia', 'instructor', NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'james.wilson@acadex.com', 'James Wilson', 'instructor', NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'emma.thompson@acadex.com', 'Emma Thompson', 'instructor', NOW(), NOW()),
('66666666-6666-6666-6666-666666666666', 'robert.brown@acadex.com', 'Robert Brown', 'instructor', NOW(), NOW());

-- Insert English Learning Courses
INSERT INTO public.courses (title, description, instructor_id, instructor_name, category, level, price, duration, rating, student_count, is_published) VALUES
-- Beginner Courses
('English Basics: Start Your Journey', 'Perfect for absolute beginners! Learn fundamental English grammar, basic vocabulary, and essential phrases for everyday conversation. Start with alphabet, numbers, and simple sentence structures.', '11111111-1111-1111-1111-111111111111', 'Sarah Johnson', 'Grammar', 'beginner', 49.00, '6 weeks', 4.8, 3420, true),

('Essential Vocabulary for Daily Life', 'Build your core English vocabulary with 500+ essential words. Learn words for family, food, shopping, weather, and everyday activities with practical examples and exercises.', '22222222-2222-2222-2222-222222222222', 'David Smith', 'Vocabulary', 'beginner', 39.00, '4 weeks', 4.7, 2890, true),

('Basic English Pronunciation', 'Master English sounds, stress patterns, and basic pronunciation rules. Perfect for beginners who want to speak clearly and be understood from day one.', '33333333-3333-3333-3333-333333333333', 'Maria Garcia', 'Pronunciation', 'beginner', 59.00, '5 weeks', 4.9, 2150, true),

('Simple Conversations in English', 'Learn to have basic conversations in English. Practice greetings, introductions, asking for directions, ordering food, and other essential daily interactions.', '44444444-4444-4444-4444-444444444444', 'James Wilson', 'Speaking', 'beginner', 69.00, '8 weeks', 4.6, 1980, true),

-- Intermediate Courses
('English Grammar Mastery', 'Take your grammar to the next level with complex tenses, conditionals, passive voice, and advanced sentence structures. Includes plenty of practice exercises and real-world examples.', '11111111-1111-1111-1111-111111111111', 'Sarah Johnson', 'Grammar', 'intermediate', 89.00, '10 weeks', 4.8, 2750, true),

('Business English Essentials', 'Master professional English for the workplace. Learn business vocabulary, email writing, presentation skills, and meeting language. Perfect for career advancement.', '55555555-5555-5555-5555-555555555555', 'Emma Thompson', 'Business English', 'intermediate', 129.00, '12 weeks', 4.9, 2340, true),

('Academic Writing Skills', 'Develop strong academic writing skills including essay structure, research techniques, citation methods, and academic vocabulary. Essential for students and professionals.', '66666666-6666-6666-6666-666666666666', 'Robert Brown', 'Writing', 'intermediate', 99.00, '8 weeks', 4.7, 1890, true),

('Intermediate Listening & Speaking', 'Improve your listening comprehension and speaking fluency through authentic materials, discussions, and interactive exercises. Build confidence in real conversations.', '33333333-3333-3333-3333-333333333333', 'Maria Garcia', 'Speaking', 'intermediate', 109.00, '10 weeks', 4.8, 2100, true),

-- Advanced Courses
('Advanced English Composition', 'Master sophisticated writing techniques, advanced grammar structures, and complex sentence patterns. Perfect for those aiming for native-level proficiency.', '66666666-6666-6666-6666-666666666666', 'Robert Brown', 'Writing', 'advanced', 149.00, '12 weeks', 4.9, 1560, true),

('English Literature & Analysis', 'Explore classic and contemporary English literature while developing critical analysis skills. Enhance vocabulary and cultural understanding through great works.', '55555555-5555-5555-5555-555555555555', 'Emma Thompson', 'Literature', 'advanced', 159.00, '14 weeks', 4.8, 890, true),

('Advanced Business Communication', 'Master high-level business communication including negotiations, presentations, complex reports, and cross-cultural business practices. For senior professionals.', '44444444-4444-4444-4444-444444444444', 'James Wilson', 'Business English', 'advanced', 199.00, '16 weeks', 4.9, 1230, true),

('IELTS/TOEFL Preparation', 'Comprehensive preparation for international English proficiency tests. Master all four skills: reading, writing, listening, and speaking with test strategies and practice.', '22222222-2222-2222-2222-222222222222', 'David Smith', 'Test Preparation', 'advanced', 179.00, '12 weeks', 4.8, 2890, true);

-- Insert English Learning Quizzes
INSERT INTO public.quizzes (title, description, category, difficulty, duration_minutes, is_published) VALUES
-- Beginner Quizzes
('Basic English Grammar', 'Test your knowledge of fundamental English grammar including articles, basic verb tenses, and sentence structure.', 'Grammar', 'beginner', 10, true),
('Essential English Vocabulary', 'Quiz on common English words used in daily life including family, food, colors, and numbers.', 'Vocabulary', 'beginner', 8, true),
('Simple Present Tense', 'Practice the simple present tense with common verbs and everyday situations.', 'Grammar', 'beginner', 12, true),
('Basic English Pronunciation', 'Test your understanding of English pronunciation rules and common sound patterns.', 'Pronunciation', 'beginner', 15, true),

-- Intermediate Quizzes
('Intermediate Grammar Challenge', 'Test your knowledge of complex tenses, conditionals, and advanced grammar structures.', 'Grammar', 'intermediate', 20, true),
('Business English Vocabulary', 'Quiz on professional English vocabulary used in workplace settings and business communications.', 'Business English', 'intermediate', 15, true),
('Academic Writing Skills', 'Test your understanding of academic writing conventions, essay structure, and formal language.', 'Writing', 'intermediate', 18, true),
('Phrasal Verbs Mastery', 'Challenge yourself with common English phrasal verbs and their meanings in context.', 'Vocabulary', 'intermediate', 16, true),

-- Advanced Quizzes
('Advanced English Grammar', 'Master level grammar quiz covering sophisticated structures, subjunctive mood, and complex syntax.', 'Grammar', 'advanced', 25, true),
('English Literature Quiz', 'Test your knowledge of English literary works, authors, and literary analysis techniques.', 'Literature', 'advanced', 30, true),
('IELTS Reading Practice', 'Practice IELTS-style reading comprehension with academic texts and complex question types.', 'Test Preparation', 'advanced', 35, true),
('Advanced Vocabulary Challenge', 'Test your knowledge of sophisticated English vocabulary including academic and professional terms.', 'Vocabulary', 'advanced', 22, true);

-- Insert Quiz Questions for Beginner Quizzes

-- Basic English Grammar Quiz Questions
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index) VALUES
((SELECT id FROM public.quizzes WHERE title = 'Basic English Grammar' LIMIT 1), 
 'Which article should you use before the word "apple"?',
 '["a", "an", "the", "no article needed"]',
 1,
 'Use "an" before words that start with a vowel sound. "Apple" starts with the vowel sound /æ/.',
 1),

((SELECT id FROM public.quizzes WHERE title = 'Basic English Grammar' LIMIT 1),
 'What is the correct form: "I _____ to school every day."',
 '["go", "goes", "going", "went"]',
 0,
 'Use "go" with the pronoun "I" in simple present tense.',
 2),

((SELECT id FROM public.quizzes WHERE title = 'Basic English Grammar' LIMIT 1),
 'Choose the correct sentence:',
 '["She have a car", "She has a car", "She having a car", "She had have a car"]',
 1,
 'Use "has" with third person singular subjects (he, she, it) in simple present tense.',
 3),

((SELECT id FROM public.quizzes WHERE title = 'Basic English Grammar' LIMIT 1),
 'Which word is a noun?',
 '["quickly", "happy", "book", "run"]',
 2,
 'A noun is a person, place, or thing. "Book" is a thing, so it''s a noun.',
 4),

((SELECT id FROM public.quizzes WHERE title = 'Basic English Grammar' LIMIT 1),
 'What is the plural of "child"?',
 '["childs", "children", "childes", "child"]',
 1,
 '"Children" is the irregular plural form of "child".',
 5);

-- Essential English Vocabulary Quiz Questions
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index) VALUES
((SELECT id FROM public.quizzes WHERE title = 'Essential English Vocabulary' LIMIT 1),
 'What do you call your mother''s sister?',
 '["cousin", "aunt", "grandmother", "sister"]',
 1,
 'Your mother''s sister is your aunt. Your father''s sister is also your aunt.',
 1),

((SELECT id FROM public.quizzes WHERE title = 'Essential English Vocabulary' LIMIT 1),
 'Which color do you get when you mix red and yellow?',
 '["purple", "green", "orange", "blue"]',
 2,
 'Red + Yellow = Orange. This is a primary color combination.',
 2),

((SELECT id FROM public.quizzes WHERE title = 'Essential English Vocabulary' LIMIT 1),
 'What do you use to eat soup?',
 '["fork", "knife", "spoon", "chopsticks"]',
 2,
 'A spoon is the correct utensil for eating soup because it can hold liquid.',
 3),

((SELECT id FROM public.quizzes WHERE title = 'Essential English Vocabulary' LIMIT 1),
 'How many days are in a week?',
 '["five", "six", "seven", "eight"]',
 2,
 'There are seven days in a week: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.',
 4);

-- Simple Present Tense Quiz Questions
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index) VALUES
((SELECT id FROM public.quizzes WHERE title = 'Simple Present Tense' LIMIT 1),
 'She _____ to work every morning at 8 AM.',
 '["go", "goes", "going", "gone"]',
 1,
 'Use "goes" with third person singular subjects (he, she, it) in simple present tense.',
 1),

((SELECT id FROM public.quizzes WHERE title = 'Simple Present Tense' LIMIT 1),
 'They _____ football on weekends.',
 '["plays", "play", "playing", "played"]',
 1,
 'Use "play" with plural subjects (they, we) in simple present tense.',
 2),

((SELECT id FROM public.quizzes WHERE title = 'Simple Present Tense' LIMIT 1),
 'Does he _____ English?',
 '["speaks", "speak", "speaking", "spoke"]',
 1,
 'After auxiliary verbs like "does," use the base form of the main verb.',
 3);

-- Basic English Pronunciation Quiz Questions
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index) VALUES
((SELECT id FROM public.quizzes WHERE title = 'Basic English Pronunciation' LIMIT 1),
 'Which word has a different vowel sound?',
 '["cat", "bat", "cake", "hat"]',
 2,
 '"Cake" has a long /eɪ/ sound, while the others have a short /æ/ sound.',
 1),

((SELECT id FROM public.quizzes WHERE title = 'Basic English Pronunciation' LIMIT 1),
 'How many syllables are in the word "computer"?',
 '["2", "3", "4", "5"]',
 1,
 '"Computer" has 3 syllables: com-pu-ter.',
 2);

-- Insert Quiz Questions for Intermediate Quizzes

-- Intermediate Grammar Challenge Questions
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index) VALUES
((SELECT id FROM public.quizzes WHERE title = 'Intermediate Grammar Challenge' LIMIT 1),
 'If I _____ more time, I would learn another language.',
 '["have", "had", "will have", "would have"]',
 1,
 'This is a second conditional sentence. Use "had" in the if-clause when talking about hypothetical present situations.',
 1),

((SELECT id FROM public.quizzes WHERE title = 'Intermediate Grammar Challenge' LIMIT 1),
 'The report _____ by the team yesterday.',
 '["completed", "was completed", "has completed", "completes"]',
 1,
 'This is passive voice in past tense. Use "was/were + past participle" for past passive constructions.',
 2),

((SELECT id FROM public.quizzes WHERE title = 'Intermediate Grammar Challenge' LIMIT 1),
 'She suggested _____ the meeting until next week.',
 '["to postpone", "postponing", "postpone", "postponed"]',
 1,
 'After "suggest," use the gerund form (-ing). "Suggest doing something" is the correct pattern.',
 3),

((SELECT id FROM public.quizzes WHERE title = 'Intermediate Grammar Challenge' LIMIT 1),
 'By the time you arrive, I _____ cooking dinner.',
 '["finish", "will finish", "will have finished", "finished"]',
 2,
 'Use future perfect tense (will have + past participle) for actions completed before a future time.',
 4);

-- Business English Vocabulary Questions
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index) VALUES
((SELECT id FROM public.quizzes WHERE title = 'Business English Vocabulary' LIMIT 1),
 'What does "ROI" stand for in business?',
 '["Return on Investment", "Rate of Interest", "Risk of Investment", "Revenue of Income"]',
 0,
 'ROI means Return on Investment - a measure of the efficiency of an investment.',
 1),

((SELECT id FROM public.quizzes WHERE title = 'Business English Vocabulary' LIMIT 1),
 'A "deadline" is:',
 '["the end of a project", "a time limit for completion", "a business meeting", "a type of contract"]',
 1,
 'A deadline is the latest time or date by which something should be completed.',
 2),

((SELECT id FROM public.quizzes WHERE title = 'Business English Vocabulary' LIMIT 1),
 'What does it mean to "schedule a meeting"?',
 '["cancel a meeting", "attend a meeting", "arrange a time for a meeting", "miss a meeting"]',
 2,
 'To schedule a meeting means to arrange or plan a specific time for the meeting to take place.',
 3);

-- Academic Writing Skills Questions
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index) VALUES
((SELECT id FROM public.quizzes WHERE title = 'Academic Writing Skills' LIMIT 1),
 'Which is the correct way to start an academic essay?',
 '["In my opinion...", "This essay will discuss...", "I think that...", "Let me tell you about..."]',
 1,
 'Academic writing should be formal and objective. "This essay will discuss..." is appropriate for academic style.',
 1),

((SELECT id FROM public.quizzes WHERE title = 'Academic Writing Skills' LIMIT 1),
 'What is a thesis statement?',
 '["The conclusion of an essay", "The main argument of an essay", "A quote from a source", "The title of an essay"]',
 1,
 'A thesis statement presents the main argument or central idea that the essay will support.',
 2),

((SELECT id FROM public.quizzes WHERE title = 'Academic Writing Skills' LIMIT 1),
 'Which citation style is commonly used in English literature?',
 '["APA", "MLA", "Chicago", "Harvard"]',
 1,
 'MLA (Modern Language Association) style is commonly used for English literature and humanities.',
 3);

-- Phrasal Verbs Mastery Questions
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index) VALUES
((SELECT id FROM public.quizzes WHERE title = 'Phrasal Verbs Mastery' LIMIT 1),
 'What does "give up" mean?',
 '["to surrender or quit", "to give a gift", "to look up", "to become angry"]',
 0,
 '"Give up" means to surrender, quit, or stop trying to do something.',
 1),

((SELECT id FROM public.quizzes WHERE title = 'Phrasal Verbs Mastery' LIMIT 1),
 'I need to _____ this information before the meeting.',
 '["look up", "look down", "look over", "look around"]',
 0,
 '"Look up" means to search for or find information, typically in a reference source.',
 2);

-- Insert Quiz Questions for Advanced Quizzes

-- Advanced English Grammar Questions
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index) VALUES
((SELECT id FROM public.quizzes WHERE title = 'Advanced English Grammar' LIMIT 1),
 'Choose the sentence with correct subjunctive mood:',
 '["I wish I was taller", "I wish I were taller", "I wish I am taller", "I wish I will be taller"]',
 1,
 'In formal English, use "were" (not "was") in subjunctive mood after "wish" for all persons.',
 1),

((SELECT id FROM public.quizzes WHERE title = 'Advanced English Grammar' LIMIT 1),
 'Identify the sentence with a dangling modifier:',
 '["Walking to school, the rain started", "While walking to school, I got wet", "Walking to school, I saw the rain", "The rain started while I was walking"]',
 0,
 'In "Walking to school, the rain started," the modifier "walking to school" incorrectly modifies "rain" instead of a person.',
 2),

((SELECT id FROM public.quizzes WHERE title = 'Advanced English Grammar' LIMIT 1),
 'Which sentence uses the subjunctive correctly?',
 '["The teacher insists that he comes early", "The teacher insists that he come early", "The teacher insists that he will come early", "The teacher insists that he is coming early"]',
 1,
 'After verbs like "insist," "demand," "suggest," use the base form of the verb (subjunctive): "he come" not "he comes."',
 3);

-- English Literature Quiz Questions
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index) VALUES
((SELECT id FROM public.quizzes WHERE title = 'English Literature Quiz' LIMIT 1),
 'Who wrote "Pride and Prejudice"?',
 '["Charlotte Brontë", "Jane Austen", "Emily Dickinson", "Virginia Woolf"]',
 1,
 'Jane Austen wrote "Pride and Prejudice" in 1813. It''s one of her most famous novels.',
 1),

((SELECT id FROM public.quizzes WHERE title = 'English Literature Quiz' LIMIT 1),
 'What literary device is used in "The wind whispered through the trees"?',
 '["metaphor", "simile", "personification", "alliteration"]',
 2,
 'Personification gives human qualities (whispering) to non-human things (wind).',
 2),

((SELECT id FROM public.quizzes WHERE title = 'English Literature Quiz' LIMIT 1),
 'Which Shakespeare play features the characters Romeo and Juliet?',
 '["Hamlet", "Macbeth", "Romeo and Juliet", "Othello"]',
 2,
 'Romeo and Juliet is the title of Shakespeare''s famous tragedy about star-crossed lovers.',
 3);

-- IELTS Reading Practice Questions
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index) VALUES
((SELECT id FROM public.quizzes WHERE title = 'IELTS Reading Practice' LIMIT 1),
 'In IELTS Reading, what should you do first?',
 '["Read the passage carefully", "Look at the questions first", "Check the time limit", "Write your answers immediately"]',
 1,
 'IELTS strategy: Always read the questions first to know what information to look for in the passage.',
 1),

((SELECT id FROM public.quizzes WHERE title = 'IELTS Reading Practice' LIMIT 1),
 'What does "skimming" mean in reading?',
 '["Reading every word carefully", "Reading quickly for main ideas", "Looking for specific information", "Reading the conclusion only"]',
 1,
 'Skimming means reading quickly to get the general idea or main points of a text.',
 2),

((SELECT id FROM public.quizzes WHERE title = 'IELTS Reading Practice' LIMIT 1),
 'How much time do you have for the IELTS Reading section?',
 '["45 minutes", "60 minutes", "75 minutes", "90 minutes"]',
 1,
 'The IELTS Reading section is 60 minutes long with 40 questions across 3 passages.',
 3);

-- Advanced Vocabulary Challenge Questions
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index) VALUES
((SELECT id FROM public.quizzes WHERE title = 'Advanced Vocabulary Challenge' LIMIT 1),
 'What does "ubiquitous" mean?',
 '["rare", "expensive", "everywhere", "difficult"]',
 2,
 'Ubiquitous means present, appearing, or found everywhere; omnipresent.',
 1),

((SELECT id FROM public.quizzes WHERE title = 'Advanced Vocabulary Challenge' LIMIT 1),
 'A "paradigm" is:',
 '["a small example", "a typical example or pattern", "a difficult problem", "a simple solution"]',
 1,
 'A paradigm is a typical example or pattern of something; a model or framework.',
 2),

((SELECT id FROM public.quizzes WHERE title = 'Advanced Vocabulary Challenge' LIMIT 1),
 'What does "ameliorate" mean?',
 '["to make worse", "to make better", "to make bigger", "to make smaller"]',
 1,
 'Ameliorate means to make something better or improve a situation.',
 3),

((SELECT id FROM public.quizzes WHERE title = 'Advanced Vocabulary Challenge' LIMIT 1),
 'What does "conundrum" mean?',
 '["a celebration", "a difficult problem", "a type of building", "a musical instrument"]',
 1,
 'A conundrum is a confusing and difficult problem or question.',
 4);

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Update quiz total_questions counts based on inserted questions
UPDATE public.quizzes SET total_questions = (
  SELECT COUNT(*) FROM public.quiz_questions WHERE quiz_id = public.quizzes.id
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable Row Level Security (RLS) after all data is inserted
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Display setup completion message
DO $$ 
BEGIN 
  RAISE NOTICE '🎉 ACADEX ENGLISH LEARNING PLATFORM SETUP COMPLETE! 🎉';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Database schema created successfully';
  RAISE NOTICE '✅ Row Level Security (RLS) policies configured';
  RAISE NOTICE '✅ Database functions and triggers installed';
  RAISE NOTICE '✅ English learning sample data inserted:';
  RAISE NOTICE '   - 6 English instructors';
  RAISE NOTICE '   - 12 English courses (beginner to advanced)';
  RAISE NOTICE '   - 12 English quizzes with questions';
  RAISE NOTICE '   - Auto user profile creation on signup';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Your English learning platform is ready to use!';
  RAISE NOTICE '📚 Categories: Grammar, Vocabulary, Pronunciation, Speaking, Writing, Business English, Literature, Test Preparation';
  RAISE NOTICE '🎯 Levels: Beginner, Intermediate, Advanced';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Next Steps:';
  RAISE NOTICE '1. Update your Supabase environment variables in your Next.js app';
  RAISE NOTICE '2. Test user registration and login';
  RAISE NOTICE '3. Try enrolling in courses and taking quizzes';
  RAISE NOTICE '4. Customize the sample data as needed';
END $$;
