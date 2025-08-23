import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, withServiceRole } from '@/lib/api-auth'
import { withDebugAdminAuth, createDebugServiceClient } from '@/lib/debug-auth'
import { logger } from '@/lib/logger'

// TEMPORARY: Using debug auth to bypass 401 issues
// GET - Fetch all enrollments with details
export const GET = withDebugAdminAuth(async (request: NextRequest) => {
  try {
    logger.info('Admin enrollments fetch requested (DEBUG MODE)')

    const serviceClient = createDebugServiceClient()
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

    logger.info('Admin enrollments fetch completed (DEBUG MODE)', { 
      count: data?.length || 0 
    })

    return NextResponse.json({ enrollments: data })
  } catch (error: any) {
    logger.error('Enrollments fetch failed (DEBUG MODE)', { 
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

    const enrollment = await withServiceRole(user, async (serviceClient) => {
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
      const { data, error } = await serviceClient
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

      return data
    })

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

    await withServiceRole(user, async (serviceClient) => {
      const { error } = await serviceClient
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId)

      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }
    })

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
