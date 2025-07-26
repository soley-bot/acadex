# Acadex Database Setup Guide

## Current Issues and Solutions

### 1. Authentication Issues
**Problem**: Users can't enroll in courses or take quizzes because user authentication isn't working properly.

**Root Cause**: 
- Users signing up through Supabase Auth are not automatically getting profiles created in the `public.users` table
- The auth flow in the React app isn't properly handling the user state

**Solutions**:
1. **Run the user trigger setup**:
   ```sql
   -- Run this in your Supabase SQL editor
   -- This will automatically create user profiles when someone signs up
   \i database/user-trigger.sql
   ```

2. **Add sample data**:
   ```sql
   -- Run this to add courses and quizzes to test with
   \i database/simple-seed.sql
   ```

### 2. Missing Sample Data
**Problem**: No courses or quizzes exist in the database for testing.

**Solution**: Run the simple-seed.sql script above.

### 3. Button Redirects to Login
**Problem**: All buttons redirect to login page even when user might be authenticated.

**Root Causes**:
- User state not properly set in AuthContext
- Database queries failing due to RLS policies or missing data
- Auth session not properly established

**Testing Steps**:
1. Visit `/debug` page to check database connection and user state
2. Try creating a test user using the debug page
3. Check browser console for any JavaScript errors
4. Verify that Supabase environment variables are correct

### 4. Database Setup Checklist

Run these in your Supabase SQL editor in order:

1. **Schema** (if not already done):
   ```sql
   \i database/schema.sql
   ```

2. **User trigger** (required for auth to work):
   ```sql
   \i database/user-trigger.sql
   ```

3. **Sample data**:
   ```sql
   \i database/simple-seed.sql
   ```

4. **Verify setup**:
   ```sql
   -- Check if tables exist and have data
   SELECT 'users' as table_name, count(*) as count FROM public.users
   UNION ALL
   SELECT 'courses', count(*) FROM public.courses  
   UNION ALL
   SELECT 'quizzes', count(*) FROM public.quizzes
   UNION ALL
   SELECT 'quiz_questions', count(*) FROM public.quiz_questions;
   ```

### 5. Testing the Application

1. **Visit the debug page**: `http://localhost:3000/debug`
2. **Create a test user** using the button on debug page
3. **Try logging in** with: `test@example.com` / `testpass123`
4. **Visit a course page**: `http://localhost:3000/courses/[course-id]`
5. **Try enrolling** in the course
6. **Visit a quiz page**: `http://localhost:3000/quizzes/[quiz-id]`
7. **Try taking** the quiz

### 6. Common Issues and Fixes

**Issue**: "User not found" or buttons still redirect to login
- Check that the user trigger is working
- Verify user exists in both `auth.users` and `public.users` tables
- Check browser dev tools for console errors

**Issue**: "Cannot read properties of undefined"
- This usually means the database query is failing
- Check RLS policies are set up correctly
- Verify the user has proper permissions

**Issue**: Quiz/Course pages show "Not Found"
- Check that sample data was inserted correctly
- Verify the dynamic routes are working
- Check that the courses/quizzes are marked as `is_published = true`

### 7. Environment Setup

Make sure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://qeoeimktkpdlbblvwhri.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlb2VpbWt0a3BkbGJibHZ3aHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDg4NzQsImV4cCI6MjA2OTA4NDg3NH0.xkRoAldCjH5oLZaeZReNbtwpbc4psZDuokp2vIhcKaI
```

### 8. Pages Available

After setup, these pages should work:
- `/` - Home page
- `/courses` - Course listing  
- `/courses/[id]` - Individual course (with enroll button)
- `/quizzes` - Quiz listing
- `/quizzes/[id]` - Individual quiz (with start button) 
- `/quizzes/[id]/take` - Take quiz
- `/quizzes/[id]/results/[resultId]` - Quiz results
- `/dashboard` - User dashboard (after login)
- `/profile` - User profile (after login)
- `/about` - About page
- `/contact` - Contact page
- `/login` - Sign in
- `/signup` - Sign up
- `/debug` - Debug information
