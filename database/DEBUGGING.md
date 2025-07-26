# SQL Debugging Guide

## Issue: "relation 'public.users' does not exist"

This error typically occurs when:
1. The table creation failed silently
2. The script execution was interrupted
3. There are permission issues
4. The table was created then dropped

## Step-by-Step Debugging

### Step 1: Run the Debug Test
1. Open Supabase SQL Editor
2. Copy and paste the contents of `debug-test.sql`
3. Run each section one at a time (don't run the entire script at once)
4. Note which step fails

### Step 2: Check Your Environment
Run these queries in the SQL Editor:

```sql
-- Check if you're in the right database
SELECT current_database();

-- Check your schema
SELECT current_schema();

-- List all tables
SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public';

-- Check permissions
SELECT has_table_privilege('public.users', 'SELECT');
```

### Step 3: Common Issues and Solutions

#### Issue A: Permission Denied
If you see permission errors:
```sql
-- Check if RLS is blocking you
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';

-- Temporarily disable RLS for debugging
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

#### Issue B: Table Creation Fails
If CREATE TABLE fails:
```sql
-- Check for existing objects with the same name
SELECT * FROM information_schema.tables WHERE table_name = 'users';
SELECT * FROM information_schema.views WHERE table_name = 'users';

-- Try dropping and recreating
DROP TABLE IF EXISTS public.users CASCADE;
```

#### Issue C: Schema Issues
If you're in the wrong schema:
```sql
-- Set the search path
SET search_path TO public;

-- Or explicitly use the schema
CREATE TABLE public.users (...);
```

### Step 4: Run Setup in Chunks

If the full script fails, try running it in these chunks:

#### Chunk 1: Core Tables Only
```sql
-- Just the essential table creation
CREATE TABLE public.users (...);
CREATE TABLE public.courses (...);
CREATE TABLE public.quizzes (...);
CREATE TABLE public.questions (...);
```

#### Chunk 2: Relationships and Indexes
```sql
-- Add foreign keys and indexes
CREATE INDEX idx_courses_instructor_id ON public.courses(instructor_id);
-- ... other indexes
```

#### Chunk 3: Functions and Triggers
```sql
-- Add the trigger function and trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() ...
```

#### Chunk 4: Sample Data
```sql
-- Insert sample data
INSERT INTO public.users ...
```

#### Chunk 5: RLS Policies
```sql
-- Enable RLS and add policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ... policies
```

### Step 5: Verification

After each chunk, verify with:
```sql
-- List tables
\dt public.*

-- Check table contents
SELECT COUNT(*) FROM public.users;
SELECT COUNT(*) FROM public.courses;
```

## Quick Fix: Minimal Working Setup

If you just want to get started quickly, run this minimal version:

```sql
-- Drop everything and start fresh
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Create just the users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test insert
INSERT INTO public.users (email, name, role) 
VALUES ('test@example.com', 'Test User', 'student');

-- Verify
SELECT * FROM public.users;
```

## Need Help?
If you're still getting errors, please share:
1. The exact error message
2. Which step in debug-test.sql failed
3. The output of the environment check queries
