import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Create authenticated Supabase client from Authorization header or cookies
function createAuthenticatedClient(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    logger.info('Using Bearer token authentication for course modules API')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })
    
    return supabase
  }
  
  // Fallback to cookie-based auth
  const { createServerClient } = require('@supabase/ssr')
  const { cookies } = require('next/headers')
  
  logger.info('Using cookie authentication for course modules API')
  return createServerClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      cookies: {
        get: (name: string) => cookies().get(name)?.value,
        set: () => {},
        remove: () => {}
      }
    }
  )
}

// Verify admin authentication
async function verifyAdminAuth(supabase: any) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      logger.warn('Course modules API: No authenticated user found')
      return { error: 'Unauthorized', user: null }
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      logger.warn(`Course modules API: User profile not found: ${user.id}`)
      return { error: 'User profile not found', user: null }
    }

    if (!['admin', 'instructor'].includes(profile.role)) {
      logger.warn(`Course modules API: Access denied for user role: ${profile.role}`)
      return { error: 'Access denied', user: null }
    }

    logger.info(`Course modules API: Admin access verified for user: ${user.id}, role: ${profile.role}`)
    return { user, role: profile.role }
  } catch (error) {
    logger.error('Course modules API: Auth verification error:', error)
    return { error: 'Authentication failed', user: null }
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAuthenticatedClient(request)
    const authResult = await verifyAdminAuth(supabase)
    
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const body = await request.json()
    const { courseId, modules } = body

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    if (!modules || !Array.isArray(modules)) {
      return NextResponse.json({ error: 'Modules array is required' }, { status: 400 })
    }

    logger.info(`Course modules API: Saving ${modules.length} modules for course ${courseId}`)

    // Delete existing modules and lessons (cascade will handle lessons)
    const { error: deleteError } = await supabase
      .from('course_modules')
      .delete()
      .eq('course_id', courseId)

    if (deleteError) {
      logger.error('Course modules API: Error deleting existing modules:', deleteError)
      throw deleteError
    }

    // Create new modules and lessons
    for (const [moduleIndex, module] of modules.entries()) {
      logger.info(`Creating module ${moduleIndex + 1}: ${module.title}`)
      
      // Create module
      const { data: moduleData, error: moduleError } = await supabase
        .from('course_modules')
        .insert({
          course_id: courseId,
          title: module.title,
          description: module.description,
          order_index: moduleIndex
        })
        .select()
        .single()

      if (moduleError) {
        logger.error('Course modules API: Error creating module:', moduleError)
        throw moduleError
      }

      // Create lessons for this module
      if (module.lessons && Array.isArray(module.lessons)) {
        for (const [lessonIndex, lesson] of module.lessons.entries()) {
          logger.info(`Creating lesson ${lessonIndex + 1} for module ${moduleIndex + 1}: ${lesson.title}`)
          
          const { error: lessonError } = await supabase
            .from('course_lessons')
            .insert({
              course_id: courseId,
              module_id: moduleData.id,
              title: lesson.title,
              description: lesson.description,
              content: lesson.content,
              video_url: lesson.video_url || null,
              duration_minutes: lesson.duration_minutes || null,
              order_index: lessonIndex,
              is_free_preview: lesson.is_free_preview || false,
              quiz_id: lesson.quiz_id || null
            })

          if (lessonError) {
            logger.error('Course modules API: Error creating lesson:', lessonError)
            throw lessonError
          }
        }
      }
    }

    logger.info(`Course modules API: Successfully saved all modules and lessons for course ${courseId}`)

    return NextResponse.json({
      success: true,
      message: 'Modules and lessons saved successfully'
    })

  } catch (error) {
    logger.error('Course modules API: Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
