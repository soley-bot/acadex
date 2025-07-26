-- CHUNK 5: Sample Data
-- Run this after all tables, constraints, and functions are set up

-- Insert instructors first
INSERT INTO public.users (id, email, name, role, avatar_url) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'emma.johnson@acadex.com', 'Emma Johnson', 'instructor', 'https://images.unsplash.com/photo-1494790108755-2616b612b29c?w=400'),
('550e8400-e29b-41d4-a716-446655440002', 'michael.chen@acadex.com', 'Michael Chen', 'instructor', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
('550e8400-e29b-41d4-a716-446655440003', 'sarah.williams@acadex.com', 'Sarah Williams', 'instructor', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400')
ON CONFLICT (id) DO NOTHING;

-- Insert sample students
INSERT INTO public.users (id, email, name, role) VALUES 
('550e8400-e29b-41d4-a716-446655440004', 'john.student@example.com', 'John Student', 'student'),
('550e8400-e29b-41d4-a716-446655440005', 'jane.learner@example.com', 'Jane Learner', 'student')
ON CONFLICT (id) DO NOTHING;

-- Insert courses
INSERT INTO public.courses (id, title, description, instructor_id, price, duration_hours, level, category, image_url) VALUES 
(
  '660e8400-e29b-41d4-a716-446655440001',
  'English Grammar Fundamentals',
  'Master the basics of English grammar with comprehensive lessons covering tenses, sentence structure, and common grammar rules.',
  '550e8400-e29b-41d4-a716-446655440001',
  49.99,
  20,
  'beginner',
  'english',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800'
),
(
  '660e8400-e29b-41d4-a716-446655440002',
  'Business English Communication',
  'Improve your professional English skills with lessons on business writing, presentations, and workplace communication.',
  '550e8400-e29b-41d4-a716-446655440002',
  79.99,
  30,
  'intermediate',
  'english',
  'https://images.unsplash.com/photo-1554774853-719586f82d77?w=800'
),
(
  '660e8400-e29b-41d4-a716-446655440003',
  'Advanced English Conversation',
  'Develop fluency and confidence in English conversation through interactive exercises and real-world scenarios.',
  '550e8400-e29b-41d4-a716-446655440003',
  69.99,
  25,
  'advanced',
  'english',
  'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800'
)
ON CONFLICT (id) DO NOTHING;

-- Insert quizzes
INSERT INTO public.quizzes (id, title, description, course_id, difficulty, time_limit) VALUES 
(
  '770e8400-e29b-41d4-a716-446655440001',
  'Grammar Basics Quiz',
  'Test your understanding of basic English grammar rules and sentence structure.',
  '660e8400-e29b-41d4-a716-446655440001',
  'easy',
  15
),
(
  '770e8400-e29b-41d4-a716-446655440002',
  'Business Vocabulary Quiz',
  'Assess your knowledge of common business English terms and phrases.',
  '660e8400-e29b-41d4-a716-446655440002',
  'medium',
  20
),
(
  '770e8400-e29b-41d4-a716-446655440003',
  'Conversation Skills Assessment',
  'Evaluate your advanced conversation abilities and idiomatic expressions.',
  '660e8400-e29b-41d4-a716-446655440003',
  'hard',
  25
)
ON CONFLICT (id) DO NOTHING;

-- Verify data was inserted
SELECT 'users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'courses', COUNT(*) FROM public.courses
UNION ALL
SELECT 'quizzes', COUNT(*) FROM public.quizzes;
