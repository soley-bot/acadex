# 🚨 ENROLLMENT 406 ERROR - COMPLETE FIX GUIDE

## Problem Analysis
The **406 error** when trying to enroll in courses is caused by **overly restrictive RLS (Row Level Security) policies** on the `enrollments` table. The error occurs because:

1. **SELECT queries** are blocked when checking enrollment status
2. **INSERT queries** are blocked when trying to create new enrollments
3. The Supabase API returns 406 when policies reject the request

## 🔧 QUICK FIX (Recommended)

### Step 1: Run the Debug Script
1. Go to **Supabase SQL Editor**
2. Copy and paste the content from `debug-enrollment-406.sql`
3. Click **Run** to execute
4. This will show you the current problem and apply an immediate fix

### Step 2: Test Enrollment
1. Go back to your app
2. Try enrolling in a course
3. The 406 error should be resolved

## 🛡️ SECURITY CONSIDERATIONS

The quick fix above creates **super-permissive policies** for testing. This is fine for development but you should implement proper security later:

```sql
-- Proper security policies (implement later)
CREATE POLICY "enrollments_own_data" ON public.enrollments
    FOR ALL USING (
        auth.uid() = user_id  -- Users can only access their own enrollments
        OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'instructor')
        )
    );
```

## 🔍 ROOT CAUSE ANALYSIS

### What Was Happening:
```javascript
// This query was being blocked by RLS:
const { data } = await supabase
  .from('enrollments')
  .select('id')
  .eq('user_id', userId)
  .eq('course_id', courseId)
  .single()
```

### Why It Failed:
1. **Authentication context** not properly passed to RLS policies
2. **Policy conditions** too restrictive for legitimate operations
3. **Supabase client** not configured with proper auth context

## 📋 PREVENTION CHECKLIST

✅ **Test RLS policies** with actual user sessions  
✅ **Use permissive policies** during development  
✅ **Check auth.uid()** availability in policies  
✅ **Test both SELECT and INSERT** operations  
✅ **Monitor Supabase logs** for policy violations  

## 🚀 NEXT STEPS

1. **Immediate**: Run `debug-enrollment-406.sql` to fix the 406 error
2. **Test**: Verify enrollment works in your app
3. **Later**: Implement proper security policies when ready
4. **Monitor**: Check if other tables have similar RLS issues

## 🎯 Expected Results After Fix

✅ **Enrollment queries work** without 406 errors  
✅ **Users can enroll** in courses successfully  
✅ **Course study pages** load properly after enrollment  
✅ **Admin panel** shows correct enrollment data  

---

**Remember**: Run the SQL script first, then test your app. The 406 error should disappear immediately!
