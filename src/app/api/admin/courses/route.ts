import { logger } from '@/lib/logger'

// File: src/app/api/admin/courses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Helper function to create authenticated Supabase client
function createAuthenticatedClient(request: NextRequest) {
  // Try to get the auth token from Authorization header first
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

  // Fallback to cookie-based auth
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: () => {}, // Not needed for API routes
        remove: () => {} // Not needed for API routes
      }
    }
  )
}

// Helper function to verify admin authentication
async function verifyAdminAuth(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  // Verify admin role from database
  const { data: userRecord, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || !userRecord || userRecord.role !== 'admin') {
    throw new Error('Admin access required')
  }

  return user
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAuthenticatedClient(request)
    
    // Verify admin authentication and get user
    const user = await verifyAdminAuth(supabase)
    
    const body = await request.json()
    const { courseData, action } = body
    // SECURITY: No longer trusting userId from client - using authenticated user.id

    logger.debug('🚀 Server-side course operation:', action)
    logger.debug('📊 Course data:', courseData)
    logger.debug('👤 Authenticated User ID:', user.id)

    let result
    if (action === 'create') {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          ...courseData,
          instructor_id: courseData.instructor_id || user.id // Use authenticated user if no instructor specified
        })
        .select()
        .single()

      if (error) throw error
      result = data
    } else if (action === 'update') {
      const { id, ...updates } = courseData
      const { data, error } = await supabase
        .from('courses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      result = data
    }

    logger.debug('✅ Server operation successful:', result.id)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    logger.error('❌ Server operation failed:', error)
    
    if (error.message === 'Authentication required') {
      return NextResponse.json({
        success: false,
        error: 'Please log in to access this resource'
      }, { status: 401 })
    }
    
    if (error.message === 'Admin access required') {
      return NextResponse.json({
        success: false,
        error: 'Admin privileges required for this operation'
      }, { status: 403 })
    }
    
    // Provide helpful error messages
    let errorMessage = error.message
    if (error.message.includes('row-level security')) {
      errorMessage = 'Access denied. Please ensure you have admin privileges.'
    } else if (error.message.includes('foreign key')) {
      errorMessage = 'Invalid user reference. Please check your admin account.'
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}

// GET endpoint to fetch courses with authentication and server-side filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = createAuthenticatedClient(request)
    
    // Verify admin authentication
    await verifyAdminAuth(supabase)
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50') // Default to 50 for admin view
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'all'

    let query = supabase
      .from('courses')
      .select('*', { count: 'exact' })

    // Server-side filtering
    if (search) {
      query = query.or(`title.ilike.%${search}%,instructor_name.ilike.%${search}%,description.ilike.%${search}%`)
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

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error: any) {
    logger.error('❌ GET courses failed:', error)
    
    if (error.message === 'Authentication required') {
      return NextResponse.json({
        success: false,
        error: 'Please log in to access this resource'
      }, { status: 401 })
    }
    
    if (error.message === 'Admin access required') {
      return NextResponse.json({
        success: false,
        error: 'Admin privileges required for this operation'
      }, { status: 403 })
    }
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    logger.info('🔄 PUT /api/admin/courses - Starting course update')
    
    const body = await request.json()
    logger.info('📝 PUT request body:', JSON.stringify(body, null, 2))
    
    const { id, ...updateData } = body
    logger.info('🆔 Course ID:', id)
    logger.info('📋 Update data:', JSON.stringify(updateData, null, 2))

    if (!id) {
      logger.warn('❌ No course ID provided')
      return NextResponse.json({
        success: false,
        error: 'Course ID is required'
      }, { status: 400 })
    }

    logger.info('🔐 Creating authenticated client...')
    const supabase = createAuthenticatedClient(request)
    
    logger.info('👤 Verifying admin authentication...')
    const user = await verifyAdminAuth(supabase)
    if (!user) {
      logger.warn('❌ PUT course - auth failed')
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }
    
    logger.info('✅ Auth verified for user:', user.id)

    logger.info('🔄 Updating course in database...')
        logger.info('🔄 Updating course in database...')
    // Update the course
    const { data: updatedCourse, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    logger.info('📊 Database update result:', {
      success: !error,
      error: error?.message,
      updatedCourse: updatedCourse ? 'Course data received' : 'No course data'
    })

    if (error) {
      logger.error('❌ PUT course - database error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update course',
        details: error.message
      }, { status: 500 })
    }

    logger.info('✅ Course updated successfully:', updatedCourse?.id)
    return NextResponse.json({
      success: true,
      data: updatedCourse
    })

  } catch (error: any) {
    logger.error('❌ PUT course - unexpected error:', error)
    
    if (error.message === 'Authentication required') {
      return NextResponse.json({
        success: false,
        error: 'Please log in to access this resource'
      }, { status: 401 })
    }
    
    if (error.message === 'Admin access required') {
      return NextResponse.json({
        success: false,
        error: 'Admin privileges required for this operation'
      }, { status: 403 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
