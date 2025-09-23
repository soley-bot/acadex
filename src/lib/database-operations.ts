import { logger } from '@/lib/logger'

// Database operations that match the exact schema structure
import { supabase, Course, Quiz, User, Enrollment, CourseModule, CourseLesson } from './supabase'
import { validateCourseData, validateQuiz, prepareCourseForDatabase, COURSE_FIELDS, QUIZ_FIELDS } from './database-types'

// Enhanced database operation with proper error handling
async function executeWithTimeout<T>(
  operation: Promise<T>, 
  timeoutMs: number = 10000,
  operationName: string = 'Database operation'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${operationName} timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  try {
    return await Promise.race([operation, timeoutPromise])
  } catch (error) {
    logger.error(`${operationName} failed:`, error)
    throw error
  }
}

// Course operations
export async function createCourse(courseData: Partial<Course>): Promise<Course> {
  logger.info('📊 [DB_CREATE] Starting course creation')
  
  const { errors } = validateCourseData(courseData)
  
  if (errors.length > 0) {
    logger.error('❌ [DB_CREATE] Validation failed:', errors)
    throw new Error(`Validation errors: ${errors.join(', ')}`)
  }

  const preparedData = prepareCourseForDatabase(courseData)
  
  try {
    const createOperation = supabase
      .from('courses')
      .insert(preparedData)
      .select(COURSE_FIELDS.join(','))
      .single()

    const result = await executeWithTimeout(
      createOperation, 
      10000, 
      'Course creation'
    ) as any

    const { data, error } = result

    if (error) {
      logger.error('❌ [DB_CREATE] Database error:', error)
      throw error
    }
    
    if (!data) {
      logger.error('❌ [DB_CREATE] No data returned')
      throw new Error('No data returned from course creation')
    }
    
    const course = data as unknown as Course
    logger.info('✅ [DB_CREATE] Course created successfully:', course.id)
    return course
  } catch (error) {
    logger.error('❌ [DB_CREATE] Create operation failed:', error)
    throw error
  }
}

export async function updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
  logger.debug('📊 [DB_UPDATE] === STARTING SIMPLIFIED UPDATE ===')
  logger.debug('📊 [DB_UPDATE] Course ID:', id)  
  logger.debug('📊 [DB_UPDATE] Updates:', updates)
  
  try {
    // Step 1: Basic validation
    const { errors } = validateCourseData(updates)
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`)
    }

    // Step 2: Prepare data for database
    const preparedData = prepareCourseForDatabase(updates)
    logger.debug('📊 [DB_UPDATE] Prepared data for DB:', preparedData)

    // Step 3: Simple update (no select, no timeout complexity)
    logger.debug('📊 [DB_UPDATE] Executing simple update...')
    const updateResult = await supabase
      .from('courses')
      .update(preparedData)
      .eq('id', id)

    logger.debug('📊 [DB_UPDATE] Update result:', updateResult)

    if (updateResult.error) {
      logger.error('❌ [DB_UPDATE] Update failed:', updateResult.error)
      throw updateResult.error
    }

    // Step 4: Fetch updated course
    logger.debug('📊 [DB_UPDATE] Fetching updated course...')
    const fetchResult = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single()

    logger.debug('📊 [DB_UPDATE] Fetch result:', fetchResult)

    if (fetchResult.error) {
      logger.error('❌ [DB_UPDATE] Fetch failed:', fetchResult.error)
      throw fetchResult.error
    }

    if (!fetchResult.data) {
      throw new Error('Course not found after update')
    }

    const updatedCourse = fetchResult.data as unknown as Course
    logger.debug('✅ [DB_UPDATE] SUCCESS! Course updated:', updatedCourse.id)
    return updatedCourse

  } catch (error) {
    logger.error('❌ [DB_UPDATE] FAILED:', error)
    throw error
  }
}

export async function getCourses(filters?: {
  category?: string
  level?: string
  is_published?: boolean
  instructor_id?: string
}): Promise<Course[]> {
  let query = supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.level) {
    query = query.eq('level', filters.level)
  }
  if (filters?.is_published !== undefined) {
    query = query.eq('is_published', filters.is_published)
  }
  if (filters?.instructor_id) {
    query = query.eq('instructor_id', filters.instructor_id)
  }

  const { data, error } = await query
  if (error) throw error
  
  return data || []
}

interface ModuleWithContent {
  id: string
  title: string
  description?: string
  order_index: number
  course_id: string
  is_published: boolean
  created_at: string
  updated_at: string
  course_lessons: Array<{
    id: string
    module_id: string
    title: string
    description?: string
    content?: string
    video_url?: string
    duration_minutes: number
    order_index: number
    is_published: boolean
    is_free_preview: boolean
    created_at: string
    updated_at: string
  }>
}

export async function getCourseWithModulesAndLessons(courseId: string): Promise<Course & { modules: ModuleWithContent[] }> {
  // Get course details
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select(COURSE_FIELDS.join(','))
    .eq('id', courseId)
    .single()

  if (courseError) throw courseError

  // Get modules with lessons
  const { data: modules, error: modulesError } = await supabase
    .from('course_modules')
    .select(`
      *,
      course_lessons (*)
    `)
    .eq('course_id', courseId)
    .order('order_index')

  if (modulesError) throw modulesError

  return {
    ...(course as unknown as Course),
    modules: modules || []
  }
}

// Quiz operations
export async function createQuiz(quizData: Partial<Quiz>) {
  const errors = validateQuiz(quizData)
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`)
  }

  const { data, error } = await supabase
    .from('quizzes')
    .insert(quizData)
    .select(QUIZ_FIELDS.join(','))
    .single()

  if (error) throw error
  return data
}

export async function getQuizzes(filters?: {
  category?: string
  difficulty?: string
  is_published?: boolean
  course_id?: string
}) {
  let query = supabase
    .from('quizzes')
    .select(QUIZ_FIELDS.join(','))
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.difficulty) {
    query = query.eq('difficulty', filters.difficulty)
  }
  if (filters?.is_published !== undefined) {
    query = query.eq('is_published', filters.is_published)
  }
  if (filters?.course_id) {
    query = query.eq('course_id', filters.course_id)
  }

  const { data, error } = await query
  if (error) throw error
  
  return (data || [])
}

// Enrollment operations
export async function enrollUserInCourse(userId: string, courseId: string) {
  // Check if already enrolled
  const { data: existing } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  if (existing) {
    throw new Error('User is already enrolled in this course')
  }

  const { data, error } = await supabase
    .from('enrollments')
    .insert({
      user_id: userId,
      course_id: courseId,
      progress: 0,
      total_watch_time_minutes: 0
    })
    .select()
    .single()

  if (error) throw error

  // Update course student count
  await supabase.rpc('increment_student_count', { course_id: courseId })

  return data
}

export async function updateEnrollmentProgress(
  userId: string, 
  courseId: string, 
  progress: number,
  currentLessonId?: string
) {
  // First check if enrollment exists
  const { data: existingEnrollment, error: checkError } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle()

  if (checkError) {
    logger.error('Error checking enrollment:', checkError)
    throw checkError
  }

  if (!existingEnrollment) {
    logger.warn('No enrollment found for user and course, skipping progress update')
    return null
  }

  const { data, error } = await supabase
    .from('enrollments')
    .update({
      progress: Math.max(0, Math.min(100, progress)),
      last_accessed_at: new Date().toISOString(),
      current_lesson_id: currentLessonId || null,
      completed_at: progress >= 100 ? new Date().toISOString() : null
    })
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .select()

  if (error) {
    logger.error('Error updating enrollment progress:', error)
    throw error
  }
  
  logger.info('Enrollment progress updated successfully')
  return data?.[0] || null // Return first item or null if array is empty
}

// User management operations
export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

interface EnrollmentRecord {
  progress?: number
  completed_at?: string | null
  enrolled_at?: string
}

interface QuizAttemptRecord {
  score?: number
  total_questions?: number
  completed_at?: string
}

// Analytics and reporting
export async function getCourseAnalytics(courseId: string) {
  // Get enrollment stats
  const { data: enrollments, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('progress, completed_at, enrolled_at')
    .eq('course_id', courseId)

  if (enrollmentError) throw enrollmentError

  // Get quiz attempts for this course
  const { data: quizAttempts, error: quizError } = await supabase
    .from('quiz_attempts')
    .select(`
      score,
      total_questions,
      completed_at,
      quizzes!inner(course_id)
    `)
    .eq('quizzes.course_id', courseId)

  if (quizError) throw quizError

  const enrollmentData = enrollments as EnrollmentRecord[]
  const attemptData = quizAttempts as QuizAttemptRecord[]

  const totalEnrollments = enrollmentData?.length || 0
  const completedEnrollments = Array.isArray(enrollmentData) ? enrollmentData.filter((e) => e.completed_at)?.length || 0 : 0
  const avgProgress = Array.isArray(enrollmentData) && totalEnrollments > 0 ? enrollmentData.reduce((sum, e) => sum + (e.progress || 0), 0) / totalEnrollments : 0
  const avgQuizScore = Array.isArray(attemptData) && attemptData.length > 0 ? attemptData.reduce((sum, a) => sum + ((a.score || 0) / (a.total_questions || 1) * 100), 0) / attemptData.length : 0

  return {
    totalEnrollments,
    completedEnrollments,
    completionRate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0,
    avgProgress,
    avgQuizScore,
    enrollmentTrend: enrollmentData?.map((e) => ({
      date: e.enrolled_at,
      count: 1
    })) || []
  }
}

// Database utility functions
export async function syncCourseStudentCount(courseId: string) {
  const { count, error } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId)

  if (error) throw error

  const { error: updateError } = await supabase
    .from('courses')
    .update({ student_count: count || 0 })
    .eq('id', courseId)

  if (updateError) throw updateError
  return count || 0
}

export async function cleanupOrphanedRecords() {
  // This function can be used to clean up any orphaned records
  // due to cascade delete issues or data inconsistencies
  
  // Remove lessons without modules
  await supabase
    .from('course_lessons')
    .delete()
    .not('module_id', 'in', '(SELECT id FROM course_modules)')

  // Remove modules without courses
  await supabase
    .from('course_modules')
    .delete()
    .not('course_id', 'in', '(SELECT id FROM courses)')

  // Add more cleanup operations as needed
}
