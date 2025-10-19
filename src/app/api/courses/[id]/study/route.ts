import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/api-auth'

// Simple in-memory cache with TTL (Time To Live)
const requestCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 30000 // 30 seconds

function getCachedResponse(key: string) {
  const cached = requestCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[API Study] Returning cached response for ${key}`)
    return cached.data
  }
  return null
}

function setCachedResponse(key: string, data: any) {
  requestCache.set(key, { data, timestamp: Date.now() })
  // Clean up old cache entries
  if (requestCache.size > 100) {
    const oldestKey = requestCache.keys().next().value
    if (oldestKey) {
      requestCache.delete(oldestKey)
    }
  }
}

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

    // Check cache first
    const cacheKey = `course-study:${courseId}:${user.id}`
    const cachedData = getCachedResponse(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    // Optimize: Run all queries in parallel using Promise.all with detailed timing
    console.log(`[API Study] Starting parallel queries...`)
    const queryStartTime = Date.now()
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
    const queryDuration = Date.now() - queryStartTime
    console.log(`[API Study] Parallel queries completed in ${queryDuration}ms`)

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
      console.log(`[API Study] Admin user detected, bypassing enrollment check`)
      isEnrolled = true
    } else {
      console.log(`[API Study] Checking enrollment...`)
      const enrollmentStartTime = Date.now()
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('progress')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle()
      console.log(`[API Study] Enrollment check completed in ${Date.now() - enrollmentStartTime}ms`)

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

    // Get lesson progress for user - OPTIMIZED: Filter by course lessons only
    console.log(`[API Study] Fetching lesson progress...`)
    const progressStartTime = Date.now()
    const lessonIds = modulesResult.data?.flatMap(module =>
      module.course_lessons?.map((lesson: any) => lesson.id) || []
    ) || []
    console.log(`[API Study] Found ${lessonIds.length} lessons to check progress for`)

    const { data: progressData, error: progressError } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', user.id)
      .in('lesson_id', lessonIds.length > 0 ? lessonIds : [''])

    console.log(`[API Study] Progress fetch completed in ${Date.now() - progressStartTime}ms, found ${progressData?.length || 0} progress records`)

    if (progressError) {
      console.error('[API Study] Progress fetch error:', progressError)
      // Don't fail the request, just return empty progress
    }

    const duration = Date.now() - startTime
    console.log(`[API Study] Request completed in ${duration}ms`)

    const responseData = {
      course: courseResult.data,
      modules: modulesResult.data || [],
      progress: progressData || [],
      enrollmentProgress,
      isEnrolled
    }

    // Cache the response
    setCachedResponse(cacheKey, responseData)

    return NextResponse.json(responseData)

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
