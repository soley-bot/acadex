-- CHUNK 6: Questions Data
-- Run this after courses and quizzes are inserted

-- Grammar Basics Quiz Questions
INSERT INTO public.questions (quiz_id, question_text, question_type, options, correct_answer, explanation, points) VALUES 
(
  '770e8400-e29b-41d4-a716-446655440001',
  'Which sentence uses the present perfect tense correctly?',
  'multiple_choice',
  '["I have lived here for 5 years.", "I am living here for 5 years.", "I live here for 5 years.", "I lived here for 5 years."]',
  'I have lived here for 5 years.',
  'The present perfect tense is used to describe actions that started in the past and continue to the present.',
  1
),
(
  '770e8400-e29b-41d4-a716-446655440001',
  'What is the plural form of "child"?',
  'multiple_choice',
  '["childs", "children", "childes", "child"]',
  'children',
  'The plural of "child" is "children" - an irregular plural form.',
  1
),
(
  '770e8400-e29b-41d4-a716-446655440001',
  'Choose the correct article: "I saw ___ elephant at the zoo."',
  'multiple_choice',
  '["a", "an", "the", "no article needed"]',
  'an',
  'Use "an" before words that begin with a vowel sound.',
  1
);

-- Business Vocabulary Quiz Questions
INSERT INTO public.questions (quiz_id, question_text, question_type, options, correct_answer, explanation, points) VALUES 
(
  '770e8400-e29b-41d4-a716-446655440002',
  'What does "bottom line" mean in business context?',
  'multiple_choice',
  '["The last line of a document", "The most important point", "The company address", "The phone number"]',
  'The most important point',
  'In business, "bottom line" refers to the most important factor or the final result.',
  1
),
(
  '770e8400-e29b-41d4-a716-446655440002',
  'Which phrase means to postpone a meeting?',
  'multiple_choice',
  '["Call off", "Call in", "Call up", "Call for"]',
  'Call off',
  '"Call off" means to cancel or postpone an event or meeting.',
  1
),
(
  '770e8400-e29b-41d4-a716-446655440002',
  'What is a "deadline"?',
  'multiple_choice',
  '["A fishing line", "The final date for completion", "A type of news", "A straight line"]',
  'The final date for completion',
  'A deadline is the latest time or date by which something should be completed.',
  1
);

-- Conversation Skills Assessment Questions
INSERT INTO public.questions (quiz_id, question_text, question_type, options, correct_answer, explanation, points) VALUES 
(
  '770e8400-e29b-41d4-a716-446655440003',
  'What does the idiom "break the ice" mean?',
  'multiple_choice',
  '["To literally break ice", "To start a conversation", "To be very cold", "To make someone angry"]',
  'To start a conversation',
  '"Break the ice" means to initiate conversation in a social setting.',
  1
),
(
  '770e8400-e29b-41d4-a716-446655440003',
  'Which response shows active listening?',
  'multiple_choice',
  '["Uh-huh", "I see what you mean, so you feel that...", "That''s nice", "OK"]',
  'I see what you mean, so you feel that...',
  'Active listening involves acknowledging and reflecting what the speaker has said.',
  1
),
(
  '770e8400-e29b-41d4-a716-446655440003',
  'What''s the best way to disagree politely in English?',
  'multiple_choice',
  '["You''re wrong", "I''m afraid I don''t quite agree", "That''s stupid", "No way"]',
  'I''m afraid I don''t quite agree',
  'Using softening phrases like "I''m afraid" makes disagreement more polite.',
  1
);

-- Verify questions were inserted
SELECT 
  q.quiz_id,
  qz.title as quiz_title,
  COUNT(*) as question_count
FROM public.questions q
JOIN public.quizzes qz ON q.quiz_id = qz.id
GROUP BY q.quiz_id, qz.title
ORDER BY qz.title;
