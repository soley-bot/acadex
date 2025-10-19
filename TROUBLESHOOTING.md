# 🔧 Troubleshooting Guide

## Authentication Timeout Errors

### Issue: "User profile fetch timed out"

**Symptoms:**
- Error in console: `[ERROR] [Auth] User profile fetch error: "User profile fetch timed out"`
- User cannot log in or session takes very long to load
- Authentication hangs on loading screen

**Possible Causes:**

#### 1. Slow Database Connection
**Diagnosis:**
- Check Supabase dashboard for database performance
- Look for slow queries in the Supabase logs

**Solution:**
```sql
-- Check if users table has proper indexes
SELECT * FROM pg_indexes WHERE tablename = 'users';

-- Should have index on id (primary key) - this is automatic
-- If missing, database might have issues
```

#### 2. Row Level Security (RLS) Policies Blocking Query
**Diagnosis:**
- Check if user exists in auth.users but not in public.users
- Verify RLS policies are correctly configured

**Solution:**
```sql
-- Check RLS policies on users table
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Verify user exists in both auth and public tables
SELECT id, email FROM auth.users WHERE id = 'user-id-here';
SELECT id, email FROM public.users WHERE id = 'user-id-here';

-- If user exists in auth but not public, create profile:
INSERT INTO public.users (id, email, name, role, created_at, updated_at)
VALUES (
  'user-auth-id',
  'user@example.com',
  'User Name',
  'student',
  NOW(),
  NOW()
);
```

#### 3. Network/Firewall Issues
**Diagnosis:**
- Timeout occurs on specific networks (corporate, public wifi)
- Works on some connections but not others

**Solution:**
- Check if firewall is blocking Supabase
- Verify HTTPS is allowed
- Try different network connection
- Check browser console for network errors

#### 4. Supabase Service Issues
**Diagnosis:**
- Check [Supabase Status Page](https://status.supabase.com/)
- Timeout happens to all users suddenly

**Solution:**
- Wait for Supabase to resolve issues
- Check project quotas in Supabase dashboard
- Consider upgrading plan if hitting limits

---

## Quick Fixes

### Increase Timeout (Temporary)
If timeouts are happening due to slow network, the timeout has been increased to 10 seconds:

File: `src/contexts/AuthContext.tsx`
- Session timeout: 10 seconds (was 8)
- Profile fetch timeout: 10 seconds (was 5)

### Clear Browser Data
Sometimes cached auth state causes issues:

```javascript
// Run in browser console
localStorage.clear()
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
})
location.reload()
```

### Verify Environment Variables
Ensure these are set correctly:

```bash
# Check in .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Debugging Steps

### 1. Check Browser Console
Look for these log messages:
```
[Auth] Starting initialization...
[Auth] Session found, fetching user profile
[Auth] Fetching user profile for: [user-id]
[Auth] User profile fetched successfully
[Auth] User authenticated successfully
```

If you see timeout between "Fetching user profile" and "User profile fetched", it's a database issue.

### 2. Test Database Query Directly

In Supabase SQL Editor:
```sql
-- Test if query is slow
EXPLAIN ANALYZE
SELECT * FROM users
WHERE id = 'user-id-here';

-- Should return in < 100ms
-- If slower, there's a database performance issue
```

### 3. Check RLS Policies

In Supabase SQL Editor:
```sql
-- View all RLS policies on users table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';
```

Expected policies:
- `users_select_own` - Allows users to read their own profile
- `users_update_own` - Allows users to update their own profile
- Admin policies for full access

### 4. Test Supabase Connection

Create a test page at `src/app/test-db/page.tsx`:

```typescript
'use client'
import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'

export default function TestDB() {
  const [status, setStatus] = useState('Testing...')

  useEffect(() => {
    async function test() {
      const supabase = createSupabaseClient()
      const start = Date.now()

      try {
        const { data, error } = await supabase
          .from('users')
          .select('count(*)')
          .limit(1)

        const time = Date.now() - start

        if (error) {
          setStatus(`Error: ${error.message} (${time}ms)`)
        } else {
          setStatus(`Success! Query took ${time}ms`)
        }
      } catch (err: any) {
        setStatus(`Exception: ${err.message}`)
      }
    }
    test()
  }, [])

  return <div className="p-8">{status}</div>
}
```

Visit `/test-db` and check the query time:
- < 500ms: Good
- 500ms - 2s: Acceptable
- > 2s: Performance issue
- Timeout: Connection problem

---

## Common Solutions

### Solution 1: Add Missing User Profile

If auth.users exists but public.users doesn't:

```sql
-- Create trigger to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'student',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Solution 2: Optimize RLS Policies

If RLS is slow, optimize policies:

```sql
-- Drop old policies
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_update_own ON users;

-- Create optimized policies
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');
```

### Solution 3: Add Database Indexes

```sql
-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
```

---

## Prevention

### Auto-Retry Mechanism
The app now automatically retries once after 3 seconds if timeout occurs.

### Better Error Messages
Improved logging shows:
- Exact error codes
- Database hints
- Network timing

### Graceful Degradation
If profile fetch fails, user can still:
- See the error message
- Click retry button
- Contact support

---

## Still Having Issues?

1. **Check Supabase Dashboard**
   - Database → Logs → Check for errors
   - Database → Performance → Check query times
   - Settings → API → Verify keys are correct

2. **Test from Different Device**
   - If works elsewhere, it's a local issue
   - Clear browser cache/cookies
   - Try incognito mode

3. **Check Project Quotas**
   - Database size limit
   - Bandwidth limit
   - Request rate limit

4. **Contact Support**
   - Provide error logs from browser console
   - Include user ID if known
   - Describe when issue started

---

## Related Files

- `src/contexts/AuthContext.tsx` - Authentication logic with timeout handling
- `src/lib/supabase.ts` - Supabase client configuration
- `src/lib/logger.ts` - Logging utility
- `database/database-schema-v3-current.sql` - Database schema with RLS policies

---

**Last Updated**: 2025-01-19
