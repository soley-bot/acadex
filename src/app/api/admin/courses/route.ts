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
      courses: data,
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

    // Whitelist of allowed fields for course updates
    const allowedFields = [
      'title',
      'description',
      'instructor_name',
      'instructor_id',
      'price',
      'category',
      'level',
      'duration',
      'image_url',
      'is_published',
      'updated_at'
    ]

    // Filter and validate update data
    const validatedData: Record<string, any> = {}
    const errors: string[] = []

    for (const [key, value] of Object.entries(updateData)) {
      if (!allowedFields.includes(key)) {
        logger.warn('Attempted to update disallowed field', {
          field: key,
          adminUserId: user.id
        })
        continue // Skip disallowed fields
      }

      // Validate specific fields
      if (key === 'title' && (!value || typeof value !== 'string' || value.trim().length < 3)) {
        errors.push('Title must be at least 3 characters')
      } else if (key === 'title' && typeof value === 'string' && value.length > 200) {
        errors.push('Title must be less than 200 characters')
      } else if (key === 'description' && value && typeof value === 'string' && value.length > 5000) {
        errors.push('Description must be less than 5000 characters')
      } else if (key === 'price' && (typeof value !== 'number' || value < 0)) {
        errors.push('Price must be a positive number')
      } else if (key === 'is_published' && typeof value !== 'boolean') {
        errors.push('is_published must be a boolean')
      } else {
        validatedData[key] = value
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        error: 'Validation failed',
        details: errors
      }, { status: 400 })
    }

    // Always update the updated_at timestamp
    validatedData.updated_at = new Date().toISOString()

    logger.info('Admin course update requested', {
      adminUserId: user.id,
      courseId: id,
      fields: Object.keys(validatedData)
    })

    const updatedCourse = await withServiceRole(user, async (serviceClient) => {
      const { data, error } = await serviceClient
        .from('courses')
        .update(validatedData)
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
