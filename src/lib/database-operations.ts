// Database operations that match the exact schema structure
import { supabase, Course, Quiz, User, Enrollment, CourseModule, CourseLesson } from './supabase'
import { validateCourse, validateQuiz, prepareCourseForDatabase, COURSE_FIELDS, QUIZ_FIELDS } from './database-types'

// Course operations
export async function createCourse(courseData: Partial<Course>): Promise<Course> {
  const errors = validateCourse(courseData)
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`)
  }

  const preparedData = prepareCourseForDatabase(courseData)
  
  const { data, error } = await supabase
    .from('courses')
    .insert(preparedData)
    .select(COURSE_FIELDS.join(','))
    .single()

  if (error) throw error
  if (!data) throw new Error('No data returned from course creation')
  return data as unknown as Course
}

export async function updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
  const errors = validateCourse(updates)
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`)
  }

  const preparedData = prepareCourseForDatabase(updates)
  
  const { data, error } = await supabase
    .from('courses')
    .update(preparedData)
    .eq('id', id)
    .select(COURSE_FIELDS.join(','))
    .single()

  if (error) throw error
  if (!data) throw new Error('No data returned from course update')
  return data as unknown as Course
}

export async function getCourses(filters?: {
  category?: string
  level?: string
  is_published?: boolean
  instructor_id?: string
}): Promise<Course[]> {
  let query = supabase
    .from('courses')
    .select(COURSE_FIELDS.join(','))
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
  return (data || []) as unknown as Course[]
}

export async function getCourseWithModulesAndLessons(courseId: string): Promise<Course & { modules: any[] }> {
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
  return data
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
    .single()

  if (error) throw error
  return data
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

  const totalEnrollments = enrollments?.length || 0
  const completedEnrollments = enrollments?.filter(e => e.completed_at)?.length || 0
  const avgProgress = enrollments?.reduce((sum, e) => sum + e.progress, 0) / totalEnrollments || 0
  const avgQuizScore = quizAttempts?.reduce((sum, a) => sum + (a.score / a.total_questions * 100), 0) / (quizAttempts?.length || 1) || 0

  return {
    totalEnrollments,
    completedEnrollments,
    completionRate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0,
    avgProgress,
    avgQuizScore,
    enrollmentTrend: enrollments?.map(e => ({
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
