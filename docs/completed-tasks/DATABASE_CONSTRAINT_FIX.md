# Fix Question Type Constraint

The error `new row for relation "quiz_questions" violates check constraint "quiz_questions_question_type_check"` occurs because the database constraint only allows old question types, but we're trying to insert new ones.

## Quick Fix - Run in Supabase Dashboard

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to**: Your project → SQL Editor
3. **Run this SQL**:

```sql
-- Drop old constraint
ALTER TABLE quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_question_type_check;

-- Add new constraint with all supported question types
ALTER TABLE quiz_questions 
ADD CONSTRAINT quiz_questions_question_type_check 
CHECK (question_type IN (
    'multiple_choice', 
    'single_choice', 
    'true_false', 
    'fill_blank', 
    'essay', 
    'matching', 
    'ordering'
));
```

4. **Click "Run"** to execute the migration
5. **Verify** by trying to create a quiz with advanced question types

## What This Fixes

**Before**: Only these question types were allowed:
- ❌ `multiple_choice`
- ❌ `true_false` 
- ❌ `fill_blank`

**After**: All these question types will work:
- ✅ `multiple_choice` (radio buttons)
- ✅ `single_choice` (single selection)
- ✅ `true_false` (True/False)
- ✅ `fill_blank` (text input)
- ✅ `essay` (textarea)
- ✅ `matching` (match pairs)
- ✅ `ordering` (arrange items)

## Verification

After running the SQL, you can verify it worked by:
1. Going to your admin panel → Quizzes → Create Quiz
2. Adding a question with type "Essay" or "Matching"
3. Saving the quiz - it should work without errors!

## Alternative: Manual Database Access

If you have direct database access, you can also run:
```bash
psql "your-database-url" -f database/fix-question-type-constraint.sql
```
