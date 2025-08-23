import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, withServiceRole } from '@/lib/api-auth'
import { logger } from '@/lib/logger'

// POST - Create or update course (SECURE)
export const POST = withAdminAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    const { courseData, action } = body

    logger.info('Admin course operation requested', { 
      adminUserId: user.id, 
      action,
      courseTitle: courseData?.title 
    })

    const result = await withServiceRole(user, async (serviceClient) => {
      if (action === 'create') {
        const { data, error } = await serviceClient
          .from('courses')
          .insert({
            ...courseData,
            instructor_id: courseData.instructor_id || user.id
          })
          .select()
          .single()

        if (error) {
          throw new Error(`Course creation failed: ${error.message}`)
        }

        return data
      } else if (action === 'update') {
        const { id, ...updates } = courseData
        
        const { data, error } = await serviceClient
          .from('courses')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()

        if (error) {
          throw new Error(`Course update failed: ${error.message}`)
        }

        return data
      } else {
        throw new Error('Invalid action specified')
      }
    })

    logger.info('Admin course operation completed', { 
      adminUserId: user.id, 
      action,
      courseId: result.id 
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    logger.error('Course operation failed', { 
      adminUserId: user.id, 
      error: error.message 
    })
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
})

// GET - Fetch all courses for admin (SECURE)
export const GET = withAdminAuth(async (request: NextRequest, user) => {
  try {
    logger.info('Admin courses fetch requested', { adminUserId: user.id })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'all'

    const { data, pagination } = await withServiceRole(user, async (serviceClient) => {
      let query = serviceClient
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

      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    })

    logger.info('Admin courses fetch completed', { 
      adminUserId: user.id, 
      count: data.length 
    })

    return NextResponse.json({
      success: true,
      data,
      pagination
    })

  } catch (error: any) {
    logger.error('Courses fetch failed', { 
      adminUserId: user.id, 
      error: error.message 
    })
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
})

// PUT - Update course (SECURE)
export const PUT = withAdminAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({
        error: 'Course ID is required'
      }, { status: 400 })
    }

    logger.info('Admin course update requested', { 
      adminUserId: user.id, 
      courseId: id 
    })

    const updatedCourse = await withServiceRole(user, async (serviceClient) => {
      const { data, error } = await serviceClient
        .from('courses')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        throw new Error(`Course update failed: ${error.message}`)
      }

      return data
    })

    logger.info('Admin course update completed', { 
      adminUserId: user.id, 
      courseId: id 
    })

    return NextResponse.json({
      success: true,
      data: updatedCourse
    })

  } catch (error: any) {
    logger.error('Course update failed', { 
      adminUserId: user.id, 
      error: error.message 
    })
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
})
