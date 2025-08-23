# 🔧 FRONTEND AUTHENTICATION FIX

## 🎯 STEP-BY-STEP SOLUTION:

### Step 1: Run Database Fixes FIRST
Run the `SUPABASE_401_FIXES.sql` file in your Supabase SQL Editor to fix the `is_admin()` function issue.

### Step 2: Test Authentication Diagnostic
1. Start your dev server: `npm run dev`
2. Login as admin user
3. Visit: `http://localhost:3000/admin/auth-diagnostic`
4. Test both "Test API (Cookies)" and "Test API (Auth Header)" buttons
5. Check the results to see what method works

### Step 3: Apply the Fix Based on Results

## 🛠️ SOLUTION A: Enhanced API Authentication (Most Likely Fix)

The issue is probably that the `createAuthenticatedClient` needs better cookie handling. Here's the fix:

### Update the enrollment page to include Authorization header:

```typescript
// In src/app/admin/enrollments/page.tsx
const fetchEnrollments = async () => {
  try {
    setLoading(true)
    setError('')
    
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession()
    
    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    
    // Add Authorization header if we have a session
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }
    
    const response = await fetch('/api/admin/enrollments', {
      method: 'GET',
      credentials: 'include', // Still include cookies as fallback
      headers
    })
    
    // Rest of your existing code...
  } catch (error) {
    // Your existing error handling...
  }
}
```

## 🛠️ SOLUTION B: Fix API Auth Client (If cookies aren't working)

If the diagnostic shows cookies aren't being read properly, update the API auth:

```typescript
// In src/lib/api-auth.ts - Enhanced createAuthenticatedClient
export function createAuthenticatedClient(request: NextRequest) {
  // Try Authorization header first (for API clients)
  const authHeader = request.headers.get('authorization')
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        },
        auth: {
          persistSession: false
        },
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {}
        }
      }
    )
  }

  // Enhanced cookie handling for browser requests
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => {
          const cookie = request.cookies.get(name)
          console.log(`Cookie ${name}:`, cookie ? 'found' : 'missing') // Debug log
          return cookie?.value
        },
        set: () => {}, 
        remove: () => {}
      }
    }
  )
}
```

## 🛠️ SOLUTION C: Temporary Service Role Fix (Quick Fix)

If you need it working immediately while we debug:

```typescript
// Temporarily modify admin enrollment route to use service role directly
export const GET = async (request: NextRequest) => {
  try {
    logger.info('Admin enrollments fetch requested (service role)')

    const serviceClient = createServiceClient()
    const { data, error } = await serviceClient
      .from('enrollments')
      .select(`
        *,
        courses (
          id,
          title,
          thumbnail_url,
          price
        ),
        users (
          id,
          name,
          email
        )
      `)
      .order('enrolled_at', { ascending: false })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return NextResponse.json({ enrollments: data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

## 📋 RECOMMENDED EXECUTION ORDER:

1. ✅ **Run SQL fixes** (fix is_admin function)
2. 🔍 **Test diagnostic page** (identify exact issue)
3. 🛠️ **Apply Solution A** (most secure)
4. 🔄 **Test enrollment page** 
5. 📝 **Report results**

**Which solution would you like me to implement first?**
