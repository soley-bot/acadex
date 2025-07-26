# Database Setup - Chunked Approach

## Overview
This approach breaks the database setup into 7 manageable chunks that can be run independently. This makes it easier to debug issues and identify exactly where problems occur.

## Quick Start

### Option 1: Run Debug Test First
1. Open Supabase SQL Editor
2. Copy and paste `debug-test.sql`
3. Run each section one at a time
4. If this works, proceed with the full setup

### Option 2: Full Chunked Setup
Run these files in order, one at a time:

1. **chunk-1-permissions.sql** - Sets up schema permissions
2. **chunk-2-tables.sql** - Creates all tables
3. **chunk-3-constraints.sql** - Adds foreign keys and indexes
4. **chunk-4-functions.sql** - Creates functions and triggers
5. **chunk-5-data.sql** - Inserts users, courses, and quizzes
6. **chunk-6-questions.sql** - Inserts quiz questions
7. **chunk-7-rls.sql** - Enables RLS and creates policies

## How to Run Each Chunk

1. Open Supabase SQL Editor
2. Copy the entire contents of the chunk file
3. Paste it into the editor
4. Click "Run" or press Ctrl/Cmd + Enter
5. Check the output for any errors
6. Verify the results using the verification queries at the bottom of each chunk
7. Only proceed to the next chunk if the current one succeeded

## Troubleshooting

### If a chunk fails:
1. Read the error message carefully
2. Check if the previous chunks completed successfully
3. Try running just the failing section again
4. Refer to `DEBUGGING.md` for specific error solutions

### Common Issues:
- **Permission denied**: Run chunk-1-permissions.sql again
- **Table already exists**: Add `IF NOT EXISTS` to CREATE TABLE statements
- **Foreign key constraint fails**: Ensure chunk-2 completed before chunk-3
- **Function doesn't exist**: Ensure chunk-4 completed before chunk-5

## Verification

After completing all chunks, run this verification query:

```sql
-- Verify all tables exist with data
SELECT 
  t.table_name,
  COALESCE(s.n_tup_ins, 0) as row_count
FROM information_schema.tables t
LEFT JOIN pg_stat_user_tables s ON t.table_name = s.relname
WHERE t.table_schema = 'public'
AND t.table_name IN ('users', 'courses', 'quizzes', 'questions', 'enrollments', 'quiz_attempts')
ORDER BY t.table_name;
```

Expected results:
- users: 5 rows
- courses: 3 rows  
- quizzes: 3 rows
- questions: 9 rows
- enrollments: 0 rows (empty initially)
- quiz_attempts: 0 rows (empty initially)

## If Everything Works
Once all chunks complete successfully, your database is ready! You can:

1. Test the Next.js application
2. Start adding more courses and quizzes
3. Enable user registration
4. Test the quiz functionality

## If Issues Persist
If you're still getting the "relation 'public.users' does not exist" error after running chunk-2, please:

1. Share the exact error message from chunk-2
2. Run the debug-test.sql and share which step fails
3. Check if you have the necessary permissions in your Supabase project

The chunked approach should make it much easier to identify exactly where the issue occurs.
