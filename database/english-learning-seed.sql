-- Clear existing data first
DELETE FROM public.quiz_questions;
DELETE FROM public.quiz_attempts;
DELETE FROM public.enrollments;
DELETE FROM public.quizzes;
DELETE FROM public.courses;
DELETE FROM public.users WHERE role = 'instructor';

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
