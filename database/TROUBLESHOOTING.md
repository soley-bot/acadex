# 🔧 Troubleshooting Guide - Database Optimization

## Common Issues & Solutions

---

## ❌ Error: "CREATE INDEX CONCURRENTLY cannot run inside a transaction block"

**Problem:** You're trying to run the original migration file that has `BEGIN...COMMIT`

**Solution:** Use the Supabase-specific version instead:

```sql
-- ✅ USE THIS FILE:
database/migrations/001-performance-optimization-supabase.sql

-- ❌ NOT THIS FILE (PostgreSQL version):
database/migrations/001-performance-optimization.sql
```

**Why:** Supabase doesn't support `CREATE INDEX CONCURRENTLY` inside transaction blocks.

---

## ❌ Error: "relation does not exist"

**Problem:** You're trying to create an index on a table that doesn't exist in your database.

**Solution:**

1. Check if table exists:
```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

2. If missing, run your main schema first:
```sql
\i database/database-schema-v3-current.sql
```

3. Then run the optimization migrations.

---

## ❌ Error: "function is_admin() does not exist"

**Problem:** The `is_admin()` function hasn't been created yet.

**Solution:**

1. Check if function exists:
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'is_admin';
```

2. If missing, create it:
```sql
CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = user_uuid AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## ❌ Error: "permission denied for schema public"

**Problem:** Your database user doesn't have permission to create indexes.

**Solution:**

In Supabase, this shouldn't happen. But if it does:

1. Check if you're logged in as the right user
2. Try running from Supabase SQL Editor (not external client)
3. Contact Supabase support if issue persists

---

## ⚠️ Migration Taking Too Long (> 10 minutes)

**Normal:** Index creation can take time on large tables

**What's happening:**
- `CREATE INDEX CONCURRENTLY` doesn't lock tables
- It scans the entire table to build the index
- Large tables (100k+ rows) can take 5-10 minutes

**To check progress:**
```sql
-- See what's running
SELECT
  pid,
  now() - query_start as duration,
  state,
  query
FROM pg_stat_activity
WHERE state != 'idle'
AND query LIKE '%CREATE INDEX%';
```

**When to worry:**
- ❌ If it takes > 30 minutes
- ❌ If CPU usage is 0% (means it's stuck)

**Solution if stuck:**
1. Cancel the query in Supabase SQL Editor
2. Check for existing locks:
```sql
SELECT * FROM pg_locks WHERE NOT granted;
```
3. Try running indexes one at a time instead of all at once

---

## ⚠️ Some Indexes Failed to Create

**Symptoms:**
- Some indexes created successfully
- Others show errors

**Common Causes:**

### 1. Index already exists
```sql
-- Check existing indexes
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';
```

**Solution:** This is actually fine! `IF NOT EXISTS` means it skips existing indexes.

### 2. Column doesn't exist
```sql
-- Check table structure
\d+ table_name

-- Or
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'your_table_name';
```

**Solution:** Your schema might be different. Skip that index or modify the column name.

---

## ⚠️ RLS Policies Not Working After Migration

**Symptoms:**
- Users can't access their own data
- "permission denied" errors
- Data not showing up

**Solution:**

1. Check if RLS is enabled:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

2. Check policies exist:
```sql
SELECT * FROM pg_policies
WHERE schemaname = 'public';
```

3. Test a specific policy:
```sql
-- As a test user, try:
SELECT * FROM enrollments WHERE user_id = auth.uid();
```

4. If broken, restore original policies from:
```sql
\i database/database-schema-v3-current.sql
```

---

## ⚠️ Performance Not Improved After Migration

**Symptoms:**
- Queries still slow
- No noticeable difference

**Diagnostic Steps:**

### 1. Check if indexes are being used:
```sql
EXPLAIN ANALYZE
SELECT * FROM enrollments WHERE user_id = 'some-user-id';
```

**Look for:**
- ✅ "Index Scan using idx_enrollments_user_id" (GOOD!)
- ❌ "Seq Scan on enrollments" (BAD - index not used)

### 2. Check if indexes were created:
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as times_used
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC;
```

**If `times_used` is 0:** Index exists but hasn't been used yet (normal initially)

### 3. Update statistics:
```sql
ANALYZE public.enrollments;
ANALYZE public.quiz_attempts;
ANALYZE public.quizzes;
ANALYZE public.courses;
```

This helps PostgreSQL know the indexes exist.

### 4. Check query plan cache:
Sometimes PostgreSQL caches old query plans. Wait 5-10 minutes or:
```sql
-- Force re-planning (reconnect helps)
DISCARD PLANS;
```

---

## ⚠️ Full-Text Search Not Working

**Symptoms:**
- `search_quizzes()` function returns error
- "function does not exist"

**Solution:**

1. Check if functions were created:
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE 'search_%';
```

2. If missing, run migration 002:
```sql
\i database/migrations/002-full-text-search.sql
```

3. Update search vectors:
```sql
UPDATE quizzes SET updated_at = updated_at;
UPDATE courses SET updated_at = updated_at;
```

---

## ⚠️ Analytics Functions Returning Wrong Results

**Symptoms:**
- `get_quiz_stats()` returns 0 for everything
- Dashboard shows no data

**Solution:**

1. Check if data exists:
```sql
SELECT COUNT(*) FROM quiz_attempts;
SELECT COUNT(*) FROM quiz_questions;
```

2. Test function directly:
```sql
SELECT * FROM get_quiz_stats(ARRAY[
  (SELECT id FROM quizzes LIMIT 1)
]);
```

3. Check function permissions:
```sql
-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_quiz_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_dashboard_stats TO authenticated;
```

---

## 🔄 How to Rollback Everything

If something goes terribly wrong:

### Step 1: Restore from backup
1. Go to **Supabase Dashboard** → **Database** → **Backups**
2. Select your backup from before migration
3. Click **Restore**

### Step 2: Or manually drop indexes:
```sql
-- Drop all created indexes
DROP INDEX CONCURRENTLY IF EXISTS idx_enrollments_user_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_quiz_attempts_user_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_lesson_progress_user_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_quiz_sessions_user_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_user_stats_user_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_notifications_user_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_course_reviews_user_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_user_badges_user_id;
DROP INDEX CONCURRENTLY IF EXISTS idx_quizzes_published_category_difficulty;
DROP INDEX CONCURRENTLY IF EXISTS idx_courses_published_category_level;
DROP INDEX CONCURRENTLY IF EXISTS idx_enrollments_user_progress;
DROP INDEX CONCURRENTLY IF EXISTS idx_quiz_attempts_quiz_completed;
DROP INDEX CONCURRENTLY IF EXISTS idx_quiz_attempts_user_completed;
DROP INDEX CONCURRENTLY IF EXISTS idx_question_attempts_quiz_attempt;
DROP INDEX CONCURRENTLY IF EXISTS idx_quiz_questions_quiz_order;
DROP INDEX CONCURRENTLY IF EXISTS idx_course_lessons_module_order;
DROP INDEX CONCURRENTLY IF EXISTS idx_quizzes_published_created;
DROP INDEX CONCURRENTLY IF EXISTS idx_courses_published_created;
DROP INDEX CONCURRENTLY IF EXISTS idx_quiz_sessions_active;
DROP INDEX CONCURRENTLY IF EXISTS idx_notifications_unread;
```

### Step 3: Restore RLS policies
Copy policies from `database-schema-v3-current.sql` and re-run them.

---

## 📊 Verification Queries

### Check Migration Status:

```sql
-- 1. Check indexes created
SELECT COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';
-- Should show ~20+ indexes

-- 2. Check RLS policies
SELECT COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public';
-- Should show your existing policies

-- 3. Check functions created
SELECT COUNT(*) as function_count
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE 'get_%';
-- Should show ~8 functions (if migration 003 ran)

-- 4. Check search vectors
SELECT
  table_name,
  column_name
FROM information_schema.columns
WHERE column_name = 'search_vector'
AND table_schema = 'public';
-- Should show 4 tables (if migration 002 ran)
```

### Test Performance:

```sql
-- Test index usage
EXPLAIN ANALYZE
SELECT * FROM enrollments
WHERE user_id = (SELECT id FROM users LIMIT 1);
-- Should show "Index Scan using idx_enrollments_user_id"

-- Test search
SELECT * FROM search_quizzes('test', NULL, NULL, true, 5);
-- Should return results quickly

-- Test analytics
SELECT * FROM get_quiz_stats(ARRAY[
  (SELECT id FROM quizzes LIMIT 1)
]);
-- Should return statistics
```

---

## 💡 Pro Tips

### Tip 1: Run Migrations in Order
Always run migrations in sequence:
1. First: 001-performance-optimization-supabase.sql
2. Then: 002-full-text-search.sql
3. Finally: 003-analytics-functions.sql

### Tip 2: Check Before Running
```sql
-- See what you're about to change
SELECT * FROM pg_indexes WHERE indexname = 'idx_enrollments_user_id';
-- If it returns nothing, safe to create
```

### Tip 3: Monitor After Deployment
```sql
-- Check index usage after 24 hours
SELECT
  indexname,
  idx_scan as times_used,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC;
```

### Tip 4: Keep Old Code Working
Don't rush to replace all queries. Let both old and new code run for a week, then gradually migrate.

---

## 📞 Still Having Issues?

1. **Check Supabase Status:** https://status.supabase.com
2. **Review Supabase Docs:** https://supabase.com/docs/guides/database
3. **Check PostgreSQL version:** Supabase uses PostgreSQL 15+
4. **Test in development first:** Clone database to staging

---

## ✅ Success Checklist

After migration, everything should:
- [ ] No errors in Supabase SQL Editor
- [ ] ~20+ indexes created
- [ ] Queries noticeably faster
- [ ] No "permission denied" errors
- [ ] Dashboard loads quickly
- [ ] Search works
- [ ] All tests pass

If all checked ✅ **Congratulations! Your database is optimized!** 🎉
