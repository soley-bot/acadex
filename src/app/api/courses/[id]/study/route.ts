import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/api-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params
    const supabase = createServiceClient()
    
    // Get user from authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check enrollment (skip for admin users)
    let isEnrolled = false
    let enrollmentProgress = 0
    
    if (user.email) {
      const { data: userRecord } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userRecord?.role === 'admin') {
        isEnrolled = true
      } else {
        const { data: enrollment, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('progress')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single()

        if (!enrollmentError && enrollment) {
          isEnrolled = true
          enrollmentProgress = enrollment.progress || 0
        }
      }
    }

    if (!isEnrolled) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 403 }
      )
    }

    // Get course with modules and lessons
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (courseError) {
      console.error('Course fetch error:', courseError)
      return NextResponse.json(
        {
          error: 'Course not found',
          details: process.env.NODE_ENV === 'development' ? courseError.message : undefined
        },
        { status: 404 }
      )
    }

    // Get modules with lessons
    const { data: modules, error: modulesError } = await supabase
      .from('course_modules')
      .select(`
        *,
        course_lessons (*)
      `)
      .eq('course_id', courseId)
      .order('order_index')

    if (modulesError) {
      console.error('Modules fetch error:', modulesError)
      return NextResponse.json(
        {
          error: 'Failed to load course modules',
          details: process.env.NODE_ENV === 'development' ? modulesError.message : undefined
        },
        { status: 500 }
      )
    }

    // Get lesson progress for user
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', user.id)

    return NextResponse.json({
      course,
      modules: modules || [],
      progress: progressData || [],
      enrollmentProgress,
      isEnrolled
    })

  } catch (error) {
    console.error('Error in course study API:', error)

    // Log detailed error information for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }

    // Return appropriate error response
    return NextResponse.json(
      {
        error: 'Failed to load course content',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
