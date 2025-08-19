// CRITICAL SECURITY FIXES REQUIRED
// ===================================

// 1. FIX AUTHENTICATION IN API ROUTES
// ====================================

// BEFORE (VULNERABLE):
const { courseData, action, userId } = body // ❌ NEVER trust client data

// AFTER (SECURE):
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  // Get user from session, not request body
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Use anon key, not service key
    {
      cookies: {
        get: (name: string) => cookies().get(name)?.value
      }
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify admin role from database
  const { data: userRecord } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userRecord?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Now safely use user.id (not from request body)
  const { courseData, action } = await request.json()
  // Process with user.id instead of userId from body
}

// 2. FIX GET ENDPOINT SECURITY
// ============================

export async function GET(request: NextRequest) {
  // Add authentication check to GET endpoint
  const supabase = createServerClient(/* same as above */)
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify admin role before returning data
  const { data: userRecord } = await supabase
    .from('users')
    .select('role') 
    .eq('id', user.id)
    .single()

  if (userRecord?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Now safely return courses
}

// 3. ENABLE RLS AND USE PROPER POLICIES
// ====================================

// Instead of service_role key, use proper RLS policies:
// In Supabase SQL Editor, ensure these policies exist:

/*
-- Courses read policy (admin + instructors + enrolled students)
CREATE POLICY "courses_read_policy" ON courses FOR SELECT USING (
  -- Admins can see all
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  OR
  -- Instructors can see their own courses
  instructor_id = auth.uid()
  OR  
  -- Students can see published courses they're enrolled in
  (is_published = true AND EXISTS (
    SELECT 1 FROM enrollments WHERE course_id = courses.id AND user_id = auth.uid()
  ))
);

-- Courses write policy (admin + instructors for their own)
CREATE POLICY "courses_write_policy" ON courses FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  OR instructor_id = auth.uid()
);
*/

// 4. FIX PERFORMANCE WITH SERVER-SIDE PAGINATION
// ==============================================

// Add to GET endpoint:
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || 'all'

  let query = supabase
    .from('courses')
    .select('*, course_modules(count)', { count: 'exact' })

  // Server-side filtering
  if (search) {
    query = query.or(`title.ilike.%${search}%,instructor_name.ilike.%${search}%`)
  }
  
  if (category !== 'all') {
    query = query.eq('category', category)
  }

  // Pagination
  const from = (page - 1) * limit
  const to = from + limit - 1
  
  const { data, error, count } = await query
    .range(from, to)
    .order('created_at', { ascending: false })

  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  })
}

// 5. UPDATE CLIENT-SIDE TO USE PAGINATION
// =======================================

// In admin/courses/page.tsx:
const [pagination, setPagination] = useState({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

const fetchCourses = useCallback(async () => {
  const params = new URLSearchParams({
    page: pagination.page.toString(),
    limit: pagination.limit.toString(),
    search: searchTerm,
    category: selectedCategory
  })

  const response = await fetch(`/api/admin/courses?${params}`)
  const result = await response.json()
  
  if (result.success) {
    setCourses(result.data)
    setPagination(result.pagination)
  }
}, [pagination.page, searchTerm, selectedCategory])

// IMMEDIATE ACTIONS REQUIRED:
// ===========================
// 1. 🚨 IMMEDIATELY disable the vulnerable endpoints
// 2. 🔐 Implement proper authentication using session cookies
// 3. 🛡️ Enable RLS policies instead of service_role bypass
// 4. ⚡ Add server-side pagination and filtering
// 5. 🧪 Test all endpoints with different user roles
