-- Verification script to check if quiz_attempts table has required columns
-- Run this after applying the migration to verify everything is working

-- Check if created_at column exists
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'quiz_attempts'
  AND column_name IN ('created_at', 'completed_at')
ORDER BY column_name;

-- Check if indexes were created
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename = 'quiz_attempts'
  AND indexname LIKE 'idx_quiz_attempts_%'
ORDER BY indexname;

-- Sample query that the analytics component will run
-- This should work without errors after the fix
SELECT 
  id,
  quiz_id,
  user_id,
  score,
  total_questions,
  created_at,
  completed_at
FROM public.quiz_attempts 
WHERE created_at >= NOW() - INTERVAL '30 days'
LIMIT 5;

-- Check row count and verify created_at is populated
SELECT 
  COUNT(*) as total_attempts,
  COUNT(created_at) as attempts_with_created_at,
  COUNT(completed_at) as attempts_with_completed_at,
  MIN(created_at) as earliest_created_at,
  MAX(created_at) as latest_created_at
FROM public.quiz_attempts;
