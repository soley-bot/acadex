-- Simple sample data that doesn't require pre-existing users

-- Insert sample courses with NULL instructor_id for now (we'll update later)
INSERT INTO public.courses (title, description, instructor_id, instructor_name, category, level, price, duration, rating, student_count, is_published) VALUES
('JavaScript Fundamentals', 'Learn the basics of JavaScript programming language. Perfect for beginners starting their web development journey.', gen_random_uuid(), 'Sarah Chen', 'Programming', 'beginner', 0.00, '4 weeks', 4.8, 1250, true),
('React Basics', 'Introduction to React framework. Build your first React applications with components, state, and props.', gen_random_uuid(), 'David Kim', 'Web Development', 'beginner', 49.00, '6 weeks', 4.7, 980, true),
('Python for Beginners', 'Start your programming journey with Python. Learn syntax, data structures, and basic programming concepts.', gen_random_uuid(), 'Maria Rodriguez', 'Programming', 'beginner', 29.00, '8 weeks', 4.9, 2100, true),
('Web Design Essentials', 'Master the fundamentals of web design including HTML, CSS, and responsive design principles.', gen_random_uuid(), 'James Wilson', 'Design', 'beginner', 39.00, '5 weeks', 4.6, 1680, true),
('Data Analysis with Excel', 'Learn data analysis techniques using Microsoft Excel. Perfect for business professionals.', gen_random_uuid(), 'Ahmed Hassan', 'Business', 'beginner', 59.00, '4 weeks', 4.5, 890, true),
('Digital Photography', 'Capture stunning photos with your camera. Learn composition, lighting, and editing techniques.', gen_random_uuid(), 'Lisa Thompson', 'Creative', 'beginner', 79.00, '6 weeks', 4.8, 1420, true);

-- Insert sample quizzes
INSERT INTO public.quizzes (title, description, category, difficulty, duration_minutes, is_published) VALUES
('JavaScript Basics Quiz', 'Test your knowledge of JavaScript fundamentals including variables, functions, and basic syntax.', 'Programming', 'beginner', 10, true),
('HTML & CSS Quiz', 'Evaluate your understanding of HTML structure and CSS styling.', 'Web Development', 'beginner', 8, true),
('Python Fundamentals', 'Quiz on Python basics including data types, loops, and conditionals.', 'Programming', 'beginner', 12, true),
('Web Design Principles', 'Test your knowledge of design fundamentals and best practices.', 'Design', 'beginner', 10, true),
('Excel Functions Quiz', 'Challenge yourself with Excel formulas and data analysis techniques.', 'Business', 'beginner', 15, true);

-- Insert sample quiz questions for JavaScript Basics Quiz
DO $$
DECLARE
    quiz_uuid UUID;
BEGIN
    -- Get the quiz ID
    SELECT id INTO quiz_uuid FROM public.quizzes WHERE title = 'JavaScript Basics Quiz' LIMIT 1;
    
    -- Insert questions
    INSERT INTO public.quiz_questions (quiz_id, question_text, options, correct_answer, explanation, order_index) VALUES
    (quiz_uuid, 'What is the correct way to declare a variable in JavaScript?', '["variable x = 5", "var x = 5", "x = 5", "declare x = 5"]', 1, 'The "var" keyword is used to declare variables in JavaScript.', 1),
    (quiz_uuid, 'Which of these is NOT a JavaScript data type?', '["string", "boolean", "integer", "undefined"]', 2, 'JavaScript has number type, but not specifically "integer". It uses floating-point numbers.', 2),
    (quiz_uuid, 'How do you write a comment in JavaScript?', '["# This is a comment", "// This is a comment", "<!-- This is a comment -->", "/* This is a comment"]', 1, 'JavaScript uses // for single-line comments and /* */ for multi-line comments.', 3),
    (quiz_uuid, 'What does the === operator do?', '["Assignment", "Equality with type checking", "Not equal", "Greater than or equal"]', 1, 'The === operator checks for equality and type, unlike == which only checks for equality.', 4),
    (quiz_uuid, 'Which method is used to add an element to the end of an array?', '["append()", "push()", "add()", "insert()"]', 1, 'The push() method adds one or more elements to the end of an array.', 5);
END $$;

-- Insert sample quiz questions for HTML & CSS Quiz  
DO $$
DECLARE
    quiz_uuid UUID;
BEGIN
    SELECT id INTO quiz_uuid FROM public.quizzes WHERE title = 'HTML & CSS Quiz' LIMIT 1;
    
    INSERT INTO public.quiz_questions (quiz_id, question_text, options, correct_answer, explanation, order_index) VALUES
    (quiz_uuid, 'What does HTML stand for?', '["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"]', 0, 'HTML stands for Hyper Text Markup Language, the standard markup language for web pages.', 1),
    (quiz_uuid, 'Which HTML tag is used for the largest heading?', '["<h6>", "<heading>", "<h1>", "<header>"]', 2, 'The <h1> tag represents the largest heading in HTML.', 2),
    (quiz_uuid, 'How do you apply CSS to an HTML document?', '["<css>", "<style>", "Both inline and external files", "<stylesheet>"]', 2, 'CSS can be applied inline, internally with <style> tags, or externally with linked files.', 3),
    (quiz_uuid, 'Which CSS property controls the text size?', '["font-weight", "text-size", "font-size", "text-style"]', 2, 'The font-size property controls the size of text in CSS.', 4);
END $$;

-- Insert sample quiz questions for Python Fundamentals
DO $$
DECLARE
    quiz_uuid UUID;
BEGIN
    SELECT id INTO quiz_uuid FROM public.quizzes WHERE title = 'Python Fundamentals' LIMIT 1;
    
    INSERT INTO public.quiz_questions (quiz_id, question_text, options, correct_answer, explanation, order_index) VALUES
    (quiz_uuid, 'How do you create a comment in Python?', '["// comment", "# comment", "<!-- comment -->", "/* comment */"]', 1, 'Python uses the # symbol for single-line comments.', 1),
    (quiz_uuid, 'Which of these is the correct way to create a list in Python?', '["list = {1, 2, 3}", "list = (1, 2, 3)", "list = [1, 2, 3]", "list = <1, 2, 3>"]', 2, 'Square brackets [] are used to create lists in Python.', 2),
    (quiz_uuid, 'What is the output of print(type(5.0))?', '["<class \'int\'>", "<class \'float\'>", "<class \'number\'>", "<class \'decimal\'>"]', 1, 'Numbers with decimal points are float type in Python.', 3),
    (quiz_uuid, 'Which keyword is used to create a function in Python?', '["function", "def", "func", "define"]', 1, 'The "def" keyword is used to define functions in Python.', 4);
END $$;
