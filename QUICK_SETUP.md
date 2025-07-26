# 🚀 ACADEX English Learning Platform - Quick Setup Guide

## Overview
This guide will help you set up your complete English learning platform database in one simple step.

## Prerequisites
- A Supabase project
- Access to the Supabase SQL Editor

## Setup Instructions

### 1. Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **"New query"**

### 2. Run the Complete Setup Script
1. Copy the entire contents of `/database/complete-setup.sql`
2. Paste it into the SQL Editor
3. Click **"Run"** to execute the script

⚠️ **Important**: Run the entire script at once - don't run it in parts.

### 3. Verify Setup
After running the script, you should see a success message with:
- ✅ Database schema created
- ✅ RLS policies configured  
- ✅ Functions and triggers installed
- ✅ English learning sample data inserted

## What Gets Created

### Database Tables
- **users** - User profiles (extends auth.users)
- **courses** - English courses 
- **quizzes** - English quizzes
- **quiz_questions** - Quiz questions with answers
- **quiz_attempts** - User quiz results
- **enrollments** - Course enrollments

### Sample Data
- **6 English instructors**
- **12 English courses** (4 beginner, 4 intermediate, 4 advanced)
- **12 English quizzes** with questions
- **Categories**: Grammar, Vocabulary, Pronunciation, Speaking, Writing, Business English, Literature, Test Preparation

### Features Included
- Row Level Security (RLS) policies
- Automatic user profile creation on signup
- Course enrollment tracking
- Quiz scoring and progress tracking
- Database functions for statistics

## Next Steps

### 1. Update Your Environment Variables
Make sure your Next.js app has the correct Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Test the Application
1. Start your Next.js development server: `npm run dev`
2. Navigate to http://localhost:3000
3. Try signing up with a new account
4. Browse courses and take quizzes
5. Check the dashboard for user progress

### 3. Customize (Optional)
- Add more courses, quizzes, and instructors
- Modify categories and difficulty levels
- Update course descriptions and pricing
- Add your own branding and content

## Troubleshooting

### Common Issues

**1. Permission Errors**
- Make sure you're running the script as a database admin
- Check that RLS policies are properly configured

**2. Data Not Showing**
- Verify the script ran completely without errors
- Check that `is_published = true` for courses and quizzes

**3. Authentication Issues**
- Ensure the user trigger is working (check if profiles are created on signup)
- Verify your Supabase environment variables

### Need Help?
- Check the debug page at `/debug` in your app
- Review the database logs in Supabase
- Ensure all migration scripts completed successfully

## Database Schema Overview

```
auth.users (Supabase built-in)
    ↓
public.users (profiles)
    ↓
public.courses ← public.enrollments → public.users
    ↓
public.quizzes ← public.quiz_attempts → public.users
    ↓
public.quiz_questions
```

Your English learning platform is now ready! 🎉
