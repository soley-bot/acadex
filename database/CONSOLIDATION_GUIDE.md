# Database Consolidation Guide

This guide explains how the fragmented SQL "fix" scripts have been consolidated into a unified schema.

## 🎯 Problem Solved

Previously, the database setup required running multiple fix scripts:
- `fix-enrollment-delete-policy.sql`
- `fix-enrollments-constraint.sql` 
- `fix-lesson-quiz-migration.sql`
- `fix-module-deletion-constraint.sql`
- `fix-question-type-constraint.sql`
- `fix-rls-policies.sql`
- `add-question-types.sql`
- `add-quiz-attempts-created-at.sql`
- And many more...

## ✅ Solution: Unified Schema

All fixes and enhancements have been consolidated into:
- **`unified-schema.sql`** - Complete database setup in a single file

## 🔄 Migration Path

### For New Installations
Simply run the unified schema:
```sql
-- In Supabase SQL Editor
\i unified-schema.sql
```

### For Existing Installations
1. **Backup your data first!**
2. Review the unified schema to see what's already applied
3. Run only the missing parts, or
4. For a clean setup, recreate the database with the unified schema

## 📋 What's Included in Unified Schema

### Core Tables
- ✅ Users with role management
- ✅ Categories with icons and colors  
- ✅ Courses with publishing workflow
- ✅ Course modules and lessons
- ✅ Enrollments with progress tracking

### Quiz System
- ✅ Quizzes (standalone and lesson-based)
- ✅ Quiz questions with multiple types (multiple_choice, true_false, fill_blank)
- ✅ Quiz attempts with comprehensive tracking
- ✅ Enhanced scoring and analytics

### Security & Performance
- ✅ Row Level Security (RLS) policies for all tables
- ✅ Storage policies for file uploads
- ✅ Performance indexes on key columns
- ✅ Proper foreign key constraints

### Automation
- ✅ Triggers for updated_at timestamps
- ✅ User creation handling
- ✅ Automatic enrollment progress calculation
- ✅ Storage bucket setup

## 🗑️ Scripts Now Obsolete

The following scripts are no longer needed (their fixes are included in unified schema):

### Constraint Fixes
- `fix-enrollments-constraint.sql` ➜ Included in enrollments table
- `fix-module-deletion-constraint.sql` ➜ Proper CASCADE in course_modules
- `fix-question-type-constraint.sql` ➜ Included in quiz_questions table

### Policy Fixes  
- `fix-rls-policies.sql` ➜ Comprehensive RLS policies included
- `fix-enrollment-delete-policy.sql` ➜ Proper enrollment policies

### Feature Additions
- `add-question-types.sql` ➜ question_type column in quiz_questions
- `add-quiz-attempts-created-at.sql` ➜ created_at in quiz_attempts
- `add-quiz-image-url.sql` ➜ image_url in quizzes table
- `add-lesson-quiz-support.sql` ➜ lesson_id in quizzes table

### Performance & Indexes
- `basic-performance-indexes.sql` ➜ Comprehensive indexes included
- `enhanced-performance-indexes.sql` ➜ All optimizations included

## 🧹 Cleanup Recommendations

After migrating to the unified schema, you can safely remove these files:

```bash
# Move obsolete scripts to archive
mkdir -p database/archive
mv database/fix-*.sql database/archive/
mv database/add-*.sql database/archive/  
mv database/*-performance-indexes.sql database/archive/
```

## 🎉 Benefits

1. **Single source of truth** - One file for complete setup
2. **Easier maintenance** - No need to track multiple fix scripts
3. **Better testing** - Can test full schema in isolation
4. **Simplified deployment** - One script for fresh installations
5. **Comprehensive documentation** - All table structures documented

## 🔍 Verification

After running the unified schema, verify everything works:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check storage buckets
SELECT * FROM storage.buckets;
```

## 📞 Support

If you encounter issues during migration:
1. Check the Supabase logs for detailed error messages
2. Ensure you have the necessary permissions
3. Verify your Supabase project has the required extensions enabled
4. Create a backup before attempting migration
