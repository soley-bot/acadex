import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import { logger } from '@/lib/logger'

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
        logger.error('Error fetching course:', courseError)
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
        logger.error('Error fetching courses:', coursesError)
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
    logger.error('Unexpected error:', error)
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
    logger.error('Error processing request:', error)
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
        instructor_id: courseData.instructor_id, // Add this line
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
    logger.error('Error creating enhanced course:', error)
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

    // Get existing modules and lessons for comparison
    const { data: existingModules, error: fetchError } = await supabase
      .from('course_modules')
      .select(`
        id,
        title,
        description,
        order_index,
        course_lessons (
          id,
          title,
          content,
          video_url,
          duration,
          order_index,
          is_preview
        )
      `)
      .eq('course_id', courseData.id)
      .order('order_index')

    if (fetchError) {
      throw new Error(`Failed to fetch existing modules: ${fetchError.message}`)
    }

    // Handle modules update/create/delete intelligently
    if (courseData.modules && courseData.modules.length > 0) {
      // Track which existing modules are being kept
      const keptModuleIds = new Set()
      
      for (let moduleIndex = 0; moduleIndex < courseData.modules.length; moduleIndex++) {
        const moduleData = courseData.modules[moduleIndex]
        
        if (moduleData.title) {
          let moduleId = moduleData.id
          
          // Check if this is an existing module or new one
          if (moduleId && existingModules?.find(m => m.id === moduleId)) {
            // Update existing module
            const { data: updatedModule, error: moduleError } = await supabase
              .from('course_modules')
              .update({
                title: moduleData.title,
                description: moduleData.description,
                order_index: moduleIndex
              })
              .eq('id', moduleId)
              .select()
              .single()

            if (moduleError) {
              throw new Error(`Module update failed: ${moduleError.message}`)
            }
            
            keptModuleIds.add(moduleId)
          } else {
            // Create new module
            const { data: newModule, error: moduleError } = await supabase
              .from('course_modules')
              .insert({
                course_id: course.id,
                title: moduleData.title,
                description: moduleData.description,
                order_index: moduleIndex
              })
              .select()
              .single()

            if (moduleError) {
              throw new Error(`Module creation failed: ${moduleError.message}`)
            }
            
            moduleId = newModule.id
            keptModuleIds.add(moduleId)
          }

          // Handle lessons for this module
          if (moduleData.lessons && moduleData.lessons.length > 0) {
            const existingModule = existingModules?.find(m => m.id === moduleId)
            const existingLessons = existingModule?.course_lessons || []
            const keptLessonIds = new Set()

            for (let lessonIndex = 0; lessonIndex < moduleData.lessons.length; lessonIndex++) {
              const lessonData = moduleData.lessons[lessonIndex]
              
              if (lessonData.title) {
                let lessonId = lessonData.id
                
                // Check if this is an existing lesson or new one
                if (lessonId && existingLessons.find(l => l.id === lessonId)) {
                  // Update existing lesson
                  const { error: lessonError } = await supabase
                    .from('course_lessons')
                    .update({
                      title: lessonData.title,
                      content: lessonData.content,
                      video_url: lessonData.video_url,
                      duration: lessonData.duration,
                      order_index: lessonIndex,
                      is_preview: lessonData.is_preview
                    })
                    .eq('id', lessonId)

                  if (lessonError) {
                    throw new Error(`Lesson update failed: ${lessonError.message}`)
                  }
                  
                  keptLessonIds.add(lessonId)
                } else {
                  // Create new lesson
                  const { data: newLesson, error: lessonError } = await supabase
                    .from('course_lessons')
                    .insert({
                      module_id: moduleId,
                      title: lessonData.title,
                      content: lessonData.content,
                      video_url: lessonData.video_url,
                      duration: lessonData.duration,
                      order_index: lessonIndex,
                      is_preview: lessonData.is_preview
                    })
                    .select()
                    .single()

                  if (lessonError) {
                    throw new Error(`Lesson creation failed: ${lessonError.message}`)
                  }
                  
                  keptLessonIds.add(newLesson.id)
                }
              }
            }

            // Delete lessons that are no longer in the module
            const lessonsToDelete = existingLessons
              .filter(l => !keptLessonIds.has(l.id))
              .map(l => l.id)

            if (lessonsToDelete.length > 0) {
              // Clear references in enrollments first
              await supabase
                .from('enrollments')
                .update({ current_lesson_id: null })
                .in('current_lesson_id', lessonsToDelete)

              // Delete the lessons
              const { error: deleteError } = await supabase
                .from('course_lessons')
                .delete()
                .in('id', lessonsToDelete)

              if (deleteError) {
                throw new Error(`Lesson deletion failed: ${deleteError.message}`)
              }
            }
          }
        }
      }

      // Delete modules that are no longer in the course
      const modulesToDelete = existingModules
        ?.filter(m => !keptModuleIds.has(m.id))
        .map(m => m.id) || []

      if (modulesToDelete.length > 0) {
        // Get lesson IDs from modules to be deleted
        const { data: lessonsToDelete, error: lessonError } = await supabase
          .from('course_lessons')
          .select('id')
          .in('module_id', modulesToDelete)

        if (!lessonError && lessonsToDelete && lessonsToDelete.length > 0) {
          // Clear references in enrollments
          await supabase
            .from('enrollments')
            .update({ current_lesson_id: null })
            .in('current_lesson_id', lessonsToDelete.map(l => l.id))
        }

        // Delete the modules (lessons will cascade)
        const { error: deleteError } = await supabase
          .from('course_modules')
          .delete()
          .in('id', modulesToDelete)

        if (deleteError) {
          throw new Error(`Module deletion failed: ${deleteError.message}`)
        }
      }
    } else {
      // No modules provided - clear all existing modules and lessons
      if (existingModules && existingModules.length > 0) {
        // Get all lesson IDs
        const allLessonIds = existingModules.flatMap(m => 
          m.course_lessons?.map(l => l.id) || []
        )

        if (allLessonIds.length > 0) {
          // Clear references in enrollments
          await supabase
            .from('enrollments')
            .update({ current_lesson_id: null })
            .in('current_lesson_id', allLessonIds)
        }

        // Delete all modules (lessons will cascade)
        const { error: deleteError } = await supabase
          .from('course_modules')
          .delete()
          .eq('course_id', courseData.id)

        if (deleteError) {
          throw new Error(`Module deletion failed: ${deleteError.message}`)
        }
      }
    }

    return { success: true, data: course }
  } catch (error: any) {
    logger.error('Error updating enhanced course:', error)
    return { success: false, error: error.message }
  }
}
