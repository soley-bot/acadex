import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/api-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  try {
    const { id: courseId } = await params
    console.log(`[API Study] Starting request for course ${courseId}`)

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

    console.log(`[API Study] User authenticated: ${user.id}`)

    // Optimize: Run all queries in parallel using Promise.all
    const [userResult, courseResult, modulesResult] = await Promise.all([
      // Get user role
      supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single(),
      // Get course
      supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single(),
      // Get modules with lessons
      supabase
        .from('course_modules')
        .select(`
          *,
          course_lessons (*)
        `)
        .eq('course_id', courseId)
        .order('order_index')
    ])

    // Check course exists
    if (courseResult.error || !courseResult.data) {
      console.error('Course fetch error:', courseResult.error)
      return NextResponse.json(
        {
          error: 'Course not found',
          details: process.env.NODE_ENV === 'development' ? courseResult.error?.message : undefined
        },
        { status: 404 }
      )
    }

    // Check enrollment (skip for admin users)
    let isEnrolled = false
    let enrollmentProgress = 0

    if (userResult.data?.role === 'admin') {
      isEnrolled = true
    } else {
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('progress')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle()

      if (!enrollmentError && enrollment) {
        isEnrolled = true
        enrollmentProgress = enrollment.progress || 0
      }
    }

    if (!isEnrolled) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 403 }
      )
    }

    if (modulesResult.error) {
      console.error('Modules fetch error:', modulesResult.error)
      return NextResponse.json(
        {
          error: 'Failed to load course modules',
          details: process.env.NODE_ENV === 'development' ? modulesResult.error.message : undefined
        },
        { status: 500 }
      )
    }

    // Get lesson progress for user
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', user.id)

    const duration = Date.now() - startTime
    console.log(`[API Study] Request completed in ${duration}ms`)

    return NextResponse.json({
      course: courseResult.data,
      modules: modulesResult.data || [],
      progress: progressData || [],
      enrollmentProgress,
      isEnrolled
    })

  } catch (error: any) {
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
