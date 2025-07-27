-- TEMPORARY FIX: Disable RLS for testing
-- WARNING: This removes security - only use for development/testing

-- Temporarily disable RLS on quizzes table
ALTER TABLE public.quizzes DISABLE ROW LEVEL SECURITY;

-- Temporarily disable RLS on quiz_questions table  
ALTER TABLE public.quiz_questions DISABLE ROW LEVEL SECURITY;

-- IMPORTANT: After testing, you should re-enable RLS and apply proper policies:
-- ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
-- Then run the fix-rls-policies.sql script
