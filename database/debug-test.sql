-- Minimal test script to debug table creation issues
-- Run this step by step in Supabase SQL Editor

-- Step 1: Check current schema
SELECT current_schema();

-- Step 2: List existing tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Step 3: Try to create just the users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Verify the table was created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users';

-- Step 5: Check table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Step 6: Try a simple insert (this should work)
INSERT INTO public.users (id, email, name, role) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', 'Test User', 'student')
ON CONFLICT (id) DO NOTHING;

-- Step 7: Verify the insert worked
SELECT * FROM public.users WHERE email = 'test@example.com';

-- Step 8: Clean up test data
DELETE FROM public.users WHERE email = 'test@example.com';
