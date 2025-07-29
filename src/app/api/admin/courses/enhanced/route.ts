import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('id')
    
    if (courseId) {
      // Get specific course with its modules and lessons
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          course_modules (
            *,
            course_lessons (*)
          )
        `)
        .eq('id', courseId)
        .single()

      if (courseError) {
        console.error('Error fetching course:', courseError)
        return NextResponse.json({ 
          success: false, 
          error: courseError.message 
        }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        data: course 
      })
    } else {
      // Get all courses with their modules and lessons
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          course_modules (
            *,
            course_lessons (*)
          )
        `)
        .order('created_at', { ascending: false })

      if (coursesError) {
        console.error('Error fetching courses:', coursesError)
        return NextResponse.json({ 
          success: false, 
          error: coursesError.message 
        }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        data: courses 
      })
    }
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseData, action, userId } = body

    // Verify user is admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (userError || !user || user.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized: Admin access required' 
      }, { status: 403 })
    }

    if (action === 'create') {
      // Create new course with full structure
      const courseResult = await createEnhancedCourse(courseData)
      return NextResponse.json(courseResult)
    } else if (action === 'update') {
      // Update existing course with full structure
      const courseResult = await updateEnhancedCourse(courseData)
      return NextResponse.json(courseResult)
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid action' 
      }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Error processing request:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

async function createEnhancedCourse(courseData: any) {
  try {
    // Start transaction by creating the main course record
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        title: courseData.title,
        description: courseData.description,
        instructor_name: courseData.instructor_name,
        category: courseData.category,
        level: courseData.level,
        duration: courseData.duration,
        price: courseData.price,
        image_url: courseData.image_url,
        is_published: courseData.is_published,
        // Enhanced fields
        learning_outcomes: courseData.learning_outcomes.map((o: any) => o.description).filter(Boolean),
        prerequisites: courseData.prerequisites.filter(Boolean),
        tags: courseData.tags.filter(Boolean),
        certificate_enabled: courseData.certificate_enabled,
        estimated_completion_time: courseData.estimated_completion_time,
        difficulty_rating: courseData.difficulty_rating
      })
      .select()
      .single()

    if (courseError) {
      throw new Error(`Course creation failed: ${courseError.message}`)
    }

    // Create modules and lessons
    if (courseData.modules && courseData.modules.length > 0) {
      for (const moduleData of courseData.modules) {
        if (moduleData.title) {
          const { data: module, error: moduleError } = await supabase
            .from('course_modules')
            .insert({
              course_id: course.id,
              title: moduleData.title,
              description: moduleData.description,
              order_index: moduleData.order_index
            })
            .select()
            .single()

          if (moduleError) {
            throw new Error(`Module creation failed: ${moduleError.message}`)
          }

          // Create lessons for this module
          if (moduleData.lessons && moduleData.lessons.length > 0) {
            for (const lessonData of moduleData.lessons) {
              if (lessonData.title) {
                const { error: lessonError } = await supabase
                  .from('course_lessons')
                  .insert({
                    module_id: module.id,
                    title: lessonData.title,
                    content: lessonData.content,
                    video_url: lessonData.video_url,
                    duration: lessonData.duration,
                    order_index: lessonData.order_index,
                    is_preview: lessonData.is_preview
                  })

                if (lessonError) {
                  throw new Error(`Lesson creation failed: ${lessonError.message}`)
                }
              }
            }
          }
        }
      }
    }

    return { success: true, data: course }
  } catch (error: any) {
    console.error('Error creating enhanced course:', error)
    return { success: false, error: error.message }
  }
}

async function updateEnhancedCourse(courseData: any) {
  try {
    // Update main course record
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .update({
        title: courseData.title,
        description: courseData.description,
        instructor_name: courseData.instructor_name,
        category: courseData.category,
        level: courseData.level,
        duration: courseData.duration,
        price: courseData.price,
        image_url: courseData.image_url,
        is_published: courseData.is_published,
        // Enhanced fields
        learning_outcomes: courseData.learning_outcomes.map((o: any) => o.description).filter(Boolean),
        prerequisites: courseData.prerequisites.filter(Boolean),
        tags: courseData.tags.filter(Boolean),
        certificate_enabled: courseData.certificate_enabled,
        estimated_completion_time: courseData.estimated_completion_time,
        difficulty_rating: courseData.difficulty_rating
      })
      .eq('id', courseData.id)
      .select()
      .single()

    if (courseError) {
      throw new Error(`Course update failed: ${courseError.message}`)
    }

    // Delete existing modules and lessons (cascade will handle lessons)
    const { error: deleteError } = await supabase
      .from('course_modules')
      .delete()
      .eq('course_id', courseData.id)

    if (deleteError) {
      throw new Error(`Module deletion failed: ${deleteError.message}`)
    }

    // Recreate modules and lessons with new structure
    if (courseData.modules && courseData.modules.length > 0) {
      for (const moduleData of courseData.modules) {
        if (moduleData.title) {
          const { data: module, error: moduleError } = await supabase
            .from('course_modules')
            .insert({
              course_id: course.id,
              title: moduleData.title,
              description: moduleData.description,
              order_index: moduleData.order_index
            })
            .select()
            .single()

          if (moduleError) {
            throw new Error(`Module creation failed: ${moduleError.message}`)
          }

          // Create lessons for this module
          if (moduleData.lessons && moduleData.lessons.length > 0) {
            for (const lessonData of moduleData.lessons) {
              if (lessonData.title) {
                const { error: lessonError } = await supabase
                  .from('course_lessons')
                  .insert({
                    module_id: module.id,
                    title: lessonData.title,
                    content: lessonData.content,
                    video_url: lessonData.video_url,
                    duration: lessonData.duration,
                    order_index: lessonData.order_index,
                    is_preview: lessonData.is_preview
                  })

                if (lessonError) {
                  throw new Error(`Lesson creation failed: ${lessonError.message}`)
                }
              }
            }
          }
        }
      }
    }

    return { success: true, data: course }
  } catch (error: any) {
    console.error('Error updating enhanced course:', error)
    return { success: false, error: error.message }
  }
}
