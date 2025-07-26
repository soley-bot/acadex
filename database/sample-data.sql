-- Insert sample courses (you'll need to replace instructor_id with actual user IDs after creating users)
INSERT INTO public.courses (title, description, instructor_id, instructor_name, category, level, price, duration, rating, student_count, is_published) VALUES
('React & TypeScript Mastery', 'Master modern React development with TypeScript. Build production-ready applications with best practices, advanced patterns, and real-world projects.', '00000000-0000-0000-0000-000000000001', 'Sarah Chen', 'Development', 'intermediate', 149.00, '12 weeks', 4.9, 2840, true),
('UI/UX Design Fundamentals', 'Learn the principles of great design and create stunning user experiences. From wireframes to prototypes, master the design process.', '00000000-0000-0000-0000-000000000002', 'David Kim', 'Design', 'beginner', 99.00, '8 weeks', 4.8, 1950, true),
('Data Science with Python', 'Dive deep into data analysis, machine learning, and statistical modeling. Work with real datasets and build predictive models.', '00000000-0000-0000-0000-000000000003', 'Maria Rodriguez', 'Data Science', 'advanced', 199.00, '16 weeks', 4.9, 3200, true),
('Digital Marketing Strategy', 'Build comprehensive marketing strategies that drive real business results. Learn SEO, social media, and analytics.', '00000000-0000-0000-0000-000000000004', 'James Wilson', 'Marketing', 'intermediate', 129.00, '10 weeks', 4.7, 1680, true),
('Cloud Architecture AWS', 'Design and implement scalable cloud solutions using AWS services. Master serverless, containers, and microservices.', '00000000-0000-0000-0000-000000000005', 'Ahmed Hassan', 'Cloud Computing', 'advanced', 179.00, '14 weeks', 4.8, 2100, true),
('Mobile App Development', 'Build native and cross-platform mobile applications from scratch. Learn React Native and Flutter.', '00000000-0000-0000-0000-000000000006', 'Lisa Thompson', 'Mobile', 'intermediate', 159.00, '12 weeks', 4.6, 1420, true);

-- Insert sample quizzes
INSERT INTO public.quizzes (title, description, category, difficulty, duration_minutes, is_published) VALUES
('React Fundamentals', 'Test your knowledge of React basics, components, and hooks.', 'Development', 'beginner', 10, true),
('JavaScript ES6+ Features', 'Challenge yourself with modern JavaScript syntax and features.', 'Development', 'intermediate', 15, true),
('UI/UX Design Principles', 'Evaluate your understanding of design fundamentals and best practices.', 'Design', 'beginner', 8, true),
('Python Data Structures', 'Test your knowledge of Python lists, dictionaries, and algorithms.', 'Data Science', 'intermediate', 12, true),
('Digital Marketing Basics', 'Quiz on fundamental marketing concepts and strategies.', 'Marketing', 'beginner', 10, true),
('AWS Cloud Services', 'Advanced quiz on Amazon Web Services and cloud architecture.', 'Cloud Computing', 'advanced', 20, true);

-- Insert sample quiz questions (for React Fundamentals quiz)
-- Note: You'll need to get the actual quiz ID after inserting quizzes
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index) VALUES
((SELECT id FROM public.quizzes WHERE title = 'React Fundamentals' LIMIT 1), 
 'What is the primary purpose of React components?',
 '["To style web pages", "To create reusable UI elements", "To manage databases", "To handle server requests"]',
 1,
 'React components are designed to create reusable UI elements that can be composed together to build complex user interfaces.',
 1),

((SELECT id FROM public.quizzes WHERE title = 'React Fundamentals' LIMIT 1),
 'Which hook is used for state management in React?',
 '["useEffect", "useState", "useContext", "useReducer"]',
 1,
 'useState is the primary hook for managing local state in functional React components.',
 2),

((SELECT id FROM public.quizzes WHERE title = 'React Fundamentals' LIMIT 1),
 'What does JSX stand for?',
 '["JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript Extension"]',
 0,
 'JSX stands for JavaScript XML. It allows you to write HTML-like syntax in JavaScript.',
 3),

((SELECT id FROM public.quizzes WHERE title = 'React Fundamentals' LIMIT 1),
 'How do you pass data from parent to child component?',
 '["Using state", "Using props", "Using context", "Using refs"]',
 1,
 'Props (properties) are used to pass data from parent components to child components.',
 4),

((SELECT id FROM public.quizzes WHERE title = 'React Fundamentals' LIMIT 1),
 'What is the Virtual DOM?',
 '["A browser API", "A JavaScript library", "A React concept for efficient rendering", "A database technology"]',
 2,
 'The Virtual DOM is a React concept that creates a virtual representation of the DOM in memory to optimize rendering performance.',
 5);

-- Insert sample quiz questions (for JavaScript ES6+ Features quiz)
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index) VALUES
((SELECT id FROM public.quizzes WHERE title = 'JavaScript ES6+ Features' LIMIT 1),
 'Which of the following is a correct way to declare a constant?',
 '["var PI = 3.14", "let PI = 3.14", "const PI = 3.14", "constant PI = 3.14"]',
 2,
 'const is used to declare constants in ES6+. The value cannot be reassigned after declaration.',
 1),

((SELECT id FROM public.quizzes WHERE title = 'JavaScript ES6+ Features' LIMIT 1),
 'What does the spread operator (...) do?',
 '["Multiplies numbers", "Expands arrays and objects", "Creates loops", "Handles errors"]',
 1,
 'The spread operator (...) expands arrays and objects, allowing you to spread their elements/properties.',
 2),

((SELECT id FROM public.quizzes WHERE title = 'JavaScript ES6+ Features' LIMIT 1),
 'Which is the correct syntax for arrow functions?',
 '["function() => {}", "() => {}", "=> () {}", "() -> {}"]',
 1,
 'Arrow functions use the syntax () => {} for function expressions.',
 3);

-- Insert sample quiz questions (for UI/UX Design Principles quiz)
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index) VALUES
((SELECT id FROM public.quizzes WHERE title = 'UI/UX Design Principles' LIMIT 1),
 'What does UX stand for?',
 '["User Experience", "User Extension", "Universal Experience", "Unified Experience"]',
 0,
 'UX stands for User Experience, which encompasses all aspects of the user''s interaction with a product.',
 1),

((SELECT id FROM public.quizzes WHERE title = 'UI/UX Design Principles' LIMIT 1),
 'Which principle focuses on making interfaces easy to understand?',
 '["Consistency", "Clarity", "Accessibility", "Feedback"]',
 1,
 'Clarity is the principle that focuses on making interfaces easy to understand and navigate.',
 2),

((SELECT id FROM public.quizzes WHERE title = 'UI/UX Design Principles' LIMIT 1),
 'What is the purpose of wireframes?',
 '["To add colors", "To show final design", "To plan layout and structure", "To write code"]',
 2,
 'Wireframes are used to plan the layout and structure of a page or app before adding visual design elements.',
 3);
