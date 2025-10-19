import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, createServiceClient } from '@/lib/api-auth'
import { logger } from '@/lib/logger'

// GET - Fetch all enrollments with details
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    logger.info('Admin enrollments fetch requested')

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const statusFilter = searchParams.get('status') || 'all'

    const serviceClient = createServiceClient()
    
    // Build query with filters
    let query = serviceClient
      .from('enrollments')
      .select(`
        *,
        courses (
          title,
          instructor_name,
          price,
          level
        ),
        users (
          name,
          email
        )
      `, { count: 'exact' })

    // Apply search filter
    if (search) {
      query = query.or(`users.name.ilike.%${search}%,users.email.ilike.%${search}%,courses.title.ilike.%${search}%`)
    }

    // Apply status filter
    if (statusFilter === 'completed') {
      query = query.not('completed_at', 'is', null)
    } else if (statusFilter === 'active') {
      query = query.is('completed_at', null)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    const { data, error, count } = await query
      .range(from, to)
      .order('enrolled_at', { ascending: false })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    // Calculate stats using optimized aggregate queries instead of fetching all records
    const [activeCountResult, completedCountResult, revenueDataResult] = await Promise.all([
      // Count active enrollments
      serviceClient
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .is('completed_at', null),

      // Count completed enrollments
      serviceClient
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .not('completed_at', 'is', null),

      // Get price data for revenue calculation (only what we need)
      serviceClient
        .from('enrollments')
        .select('courses!inner(price)')
    ])

    const totalEnrollments = count || 0
    const activeEnrollments = activeCountResult.count || 0
    const completedEnrollments = completedCountResult.count || 0
    const totalRevenue = revenueDataResult.data?.reduce((sum, e: any) => {
      const price = Array.isArray(e.courses) ? e.courses[0]?.price : e.courses?.price
      return sum + (Number(price) || 0)
    }, 0) || 0

    logger.info('Admin enrollments fetch completed', { 
      count: data?.length || 0,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments
    })

    return NextResponse.json({ 
      data: data || [],
      pagination: {
        page,
        limit,
        total: totalEnrollments,
        totalPages: Math.ceil(totalEnrollments / limit)
      },
      stats: {
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        totalRevenue
      }
    })
  } catch (error: any) {
    logger.error('Enrollments fetch failed', { 
      error: error.message 
    })
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
})

// POST - Create new enrollment (manual enrollment by admin)
export const POST = withAdminAuth(async (request: NextRequest, user) => {
  try {
    const { user_id, course_id } = await request.json()

    if (!user_id || !course_id) {
      return NextResponse.json({ error: 'User ID and Course ID are required' }, { status: 400 })
    }

    logger.info('Admin enrollment creation requested', { 
      adminUserId: user.id, 
      targetUserId: user_id, 
      courseId: course_id 
    })

    const serviceClient = createServiceClient()

    // Check if enrollment already exists
    const { data: existingEnrollment } = await serviceClient
      .from('enrollments')
      .select('id')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .single()

    if (existingEnrollment) {
      throw new Error('User is already enrolled in this course')
    }

    // Create new enrollment
    const { data: enrollment, error } = await serviceClient
      .from('enrollments')
      .insert({
        user_id,
        course_id,
        progress: 0,
        enrolled_at: new Date().toISOString(),
        total_watch_time_minutes: 0
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    logger.info('Admin enrollment creation completed', { 
      adminUserId: user.id, 
      enrollmentId: enrollment.id 
    })

    return NextResponse.json({ enrollment }, { status: 201 })
  } catch (error: any) {
    logger.error('Enrollment creation failed', { 
      adminUserId: user.id, 
      error: error.message 
    })
    
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('already enrolled') ? 409 : 500 }
    )
  }
})

// DELETE - Remove enrollment (unenroll student)  
export const DELETE = withAdminAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const enrollmentId = searchParams.get('id')

    if (!enrollmentId) {
      return NextResponse.json({ error: 'Enrollment ID is required' }, { status: 400 })
    }

    logger.info('Admin enrollment deletion requested', { 
      adminUserId: user.id, 
      enrollmentId 
    })

    const serviceClient = createServiceClient()

    const { error } = await serviceClient
      .from('enrollments')
      .delete()
      .eq('id', enrollmentId)

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    logger.info('Admin enrollment deletion completed', { 
      adminUserId: user.id, 
      enrollmentId 
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    logger.error('Enrollment deletion failed', { 
      adminUserId: user.id, 
      error: error.message 
    })
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
})
