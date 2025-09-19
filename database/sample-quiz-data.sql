-- =====================================================
-- SAMPLE QUIZ DATA for Testing Admin Dashboard
-- =====================================================

-- Insert a few sample quizzes for testing the admin dashboard
INSERT INTO public.quizzes (
    title, 
    description, 
    category, 
    difficulty, 
    duration_minutes,
    total_questions,
    passing_score,
    is_published,
    image_url
) VALUES
    (
        'English Grammar Basics',
        'Test your understanding of basic English grammar rules including tenses, articles, and sentence structure.',
        'grammar',
        'beginner',
        15,
        10,
        70,
        true,
        '/images/courses/grammar-basics.jpg'
    ),
    (
        'IELTS Reading Practice Test',
        'Practice IELTS reading comprehension with authentic test materials and time constraints.',
        'ielts-reading', 
        'intermediate',
        60,
        40,
        65,
        true,
        '/images/courses/ielts-reading.jpg'
    ),
    (
        'Business Vocabulary Quiz',
        'Expand your business English vocabulary with common terms used in professional settings.',
        'business-comm',
        'intermediate',
        20,
        15,
        75,
        true,
        '/images/courses/business-vocab.jpg'
    ),
    (
        'Advanced Writing Skills',
        'Advanced writing techniques for academic and professional communication.',
        'academic-writing',
        'advanced',
        45,
        25,
        80,
        false,
        '/images/courses/academic-writing.jpg'
    )
ON CONFLICT DO NOTHING;

-- Insert sample questions for the first quiz
INSERT INTO public.quiz_questions (
    quiz_id,
    question_text,
    question_type,
    options,
    correct_answer,
    explanation,
    points,
    order_index
)
SELECT 
    q.id,
    qq.question_text,
    qq.question_type,
    qq.options,
    qq.correct_answer,
    qq.explanation,
    qq.points,
    qq.order_index
FROM public.quizzes q
CROSS JOIN (VALUES
    ('Choose the correct form: "I _____ to school every day."', 'multiple_choice', '["go", "goes", "going", "went"]'::jsonb, 0, 'Present simple tense uses the base form for "I"', 1, 1),
    ('Which article should be used: "I saw _____ elephant at the zoo."', 'multiple_choice', '["a", "an", "the", "no article"]'::jsonb, 1, 'Use "an" before words starting with vowel sounds', 1, 2),
    ('The past tense of "run" is "ran".', 'true_false', '["True", "False"]'::jsonb, 0, 'The past tense of "run" is indeed "ran"', 1, 3),
    ('Complete the sentence: "She _____ her homework yesterday."', 'multiple_choice', '["do", "does", "did", "doing"]'::jsonb, 2, 'Past tense requires "did"', 1, 4),
    ('What is the plural of "child"?', 'fill_blank', '[]'::jsonb, '"children"'::jsonb, 'The irregular plural of "child" is "children"', 1, 5)
) AS qq(question_text, question_type, options, correct_answer, explanation, points, order_index)
WHERE q.title = 'English Grammar Basics'
ON CONFLICT DO NOTHING;

-- Update quiz question counts
UPDATE public.quizzes 
SET total_questions = (
    SELECT COUNT(*) 
    FROM public.quiz_questions 
    WHERE quiz_questions.quiz_id = quizzes.id
)
WHERE EXISTS (
    SELECT 1 
    FROM public.quiz_questions 
    WHERE quiz_questions.quiz_id = quizzes.id
);