import { supabase } from './supabase'
import type { User, Course, Quiz, QuizQuestion, QuizAttempt, Enrollment } from './supabase'

import { logger } from '@/lib/logger'

// User Operations
export const userAPI = {
  // Get current user profile
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return { data, error }
  },

  // Create or update user profile
  async upsertProfile(profile: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .upsert(profile)
      .select()
      .single()

    return { data, error }
  },

  // Update user profile
  async updateProfile(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  }
}

// Course Operations
export const courseAPI = {
  // Get paginated published courses
  async getCourses(filters?: { 
    category?: string; 
    level?: string; 
    search?: string;
    page?: number;
    limit?: number
  }) {
    const page = filters?.page || 1
    const limit = filters?.limit || 12
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        instructor_id,
        instructor_name,
        category,
        level,
        price,
        duration,
        image_url,
        rating,
        student_count,
        is_published,
        created_at,
        updated_at
      `, { count: 'exact' })
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.level) {
      query = query.eq('level', filters.level)
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error, count } = await query
    
    return { 
      data, 
      error, 
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: (count || 0) > to + 1
      }
    }
  },

  // Get single course
  async getCourse(id: string) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single()

    return { data, error }
  },

  // Create new course (instructors only)
  async createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('courses')
      .insert(course)
      .select()
      .single()

    return { data, error }
  },

  // Update course
  async updateCourse(id: string, updates: Partial<Course>) {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  // Get popular courses
  async getPopularCourses(limit = 6) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        enrollments(count)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Calculate student count from enrollments if not set
    const coursesWithCounts = data?.map((course: any) => ({
      ...course,
      student_count: course.student_count || course.enrollments?.length || 0,
      rating: course.rating || 4.5 // Default rating if not set
    }))

    return { data: coursesWithCounts, error }
  }
}

// Quiz Operations
export const quizAPI = {
  // Get paginated published quizzes
  async getQuizzes(filters?: { 
    category?: string; 
    difficulty?: string; 
    page?: number; 
    limit?: number 
  }) {
    const page = filters?.page || 1
    const limit = filters?.limit || 12
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('quizzes')
      .select(`
        id,
        title,
        description,
        category,
        difficulty,
        duration_minutes,
        total_questions,
        is_published,
        created_at
      `, { count: 'exact' })
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty)
    }

    const { data, error, count } = await query
    
    return { 
      data, 
      error, 
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: (count || 0) > to + 1
      }
    }
  },

  // Get single quiz with questions
  async getQuizWithQuestions(id: string) {
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single()

    if (quizError) return { data: null, error: quizError }

    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', id)
      .order('order_index')

    return { 
      data: quiz ? { ...quiz, questions } : null, 
      error: questionsError 
    }
  },

  // Create quiz attempt
  async createQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'completed_at'>) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert(attempt)
      .select()
      .single()

    return { data, error }
  },

  // Get user's quiz attempts
  async getUserQuizAttempts(userId: string, filters?: {
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quizzes (
          title,
          category,
          difficulty
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .range(from, to)

    return { 
      data, 
      error, 
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: (count || 0) > to + 1
      }
    }
  },

  // Get quiz statistics
  async getQuizStats(quizId: string) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('score, total_questions')
      .eq('quiz_id', quizId)

    if (error) return { data: null, error }

    const attempts = data.length
    const avgScore = attempts > 0 
      ? data.reduce((sum: number, attempt: any) => sum + (attempt.score / attempt.total_questions), 0) / attempts * 100
      : 0

    return { 
      data: { 
        totalAttempts: attempts, 
        averageScore: Math.round(avgScore) 
      }, 
      error: null 
    }
  }
}

// Enrollment Operations
export const enrollmentAPI = {
  // Enroll in course
  async enrollInCourse(userId: string, courseId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        progress: 0
      })
      .select()
      .single()

    // Update course student count
    if (!error) {
      // supabase.rpc('increment_student_count', { course_id: courseId })
    }

    return { data, error }
  },

  // Get user enrollments
  async getUserEnrollments(userId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses (
          title,
          description,
          instructor_name,
          category,
          level,
          image_url,
          duration
        )
      `)
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false })

    return { data, error }
  },

  // Update enrollment progress
  async updateProgress(enrollmentId: string, progress: number) {
    const updates: any = { progress }
    if (progress >= 100) {
      updates.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('enrollments')
      .update(updates)
      .eq('id', enrollmentId)
      .select()
      .single()

    return { data, error }
  },

  // Check if user is enrolled
  async isEnrolled(userId: string, courseId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    return { enrolled: !!data, error }
  }
}

// Authentication helpers
export const authAPI = {
  // Sign up
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })

    if (data.user && !error) {
      // Create user profile
      await userAPI.upsertProfile({
        id: data.user.id,
        email,
        name,
        role: 'student'
      })
    }

    return { data, error }
  },

  // Sign in
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    return { data, error }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get session
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  }
}

// Export functions for easier imports
export async function getCourses(filters?: { category?: string; level?: string; search?: string }) {
  return courseAPI.getCourses(filters)
}

export async function getQuizzes(filters?: { category?: string; difficulty?: string }) {
  let query = supabase
    .from('quizzes')
    .select(`
      *,
      question_count:quiz_questions(count)
    `)
    .eq('is_published', true)

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.difficulty) {
    query = query.eq('difficulty', filters.difficulty)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    logger.error('Error fetching quizzes:', error)
    return []
  }

  // Transform the data to include question_count as a number
  return data?.map((quiz: any) => ({
    ...quiz,
    question_count: quiz.question_count?.[0]?.count || 0
  })) || []
}

export async function getRandomQuizQuestions(limit: number = 3) {
  // Get a few random questions from different categories for preview
  const { data, error } = await supabase
    .from('quiz_questions')
    .select(`
      *,
      quiz:quizzes(title, category, difficulty)
    `)
    .limit(limit)

  if (error) {
    logger.error('Error fetching random quiz questions:', error)
    return []
  }

  return data || []
}

// Additional functions for new pages
export const getCourseById = async (courseId: string) => {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      users!courses_instructor_id_fkey(name)
    `)
    .eq('id', courseId)
    .eq('is_published', true)
    .single()

  if (data) {
    data.instructor_name = data.users?.name || 'Unknown Instructor'
  }

  return { data, error }
}

export const getQuizById = async (quizId: string) => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .eq('is_published', true)
    .single()

  return { data, error }
}

export const getQuizQuestions = async (quizId: string) => {
  const [quizResult, questionsResult] = await Promise.all([
    supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single(),
    supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_index')
  ])

  return {
    data: {
      quiz: quizResult.data,
      questions: questionsResult.data
    },
    error: quizResult.error || questionsResult.error
  }
}

export const submitQuizAttempt = async (attemptData: {
  quiz_id: string
  user_id: string
  answers: Record<string, any> // Changed from number to any to support different answer types
  time_taken_seconds?: number
}) => {
  // First, get the correct answers
  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', attemptData.quiz_id)

  if (!questions) {
    return { data: null, error: { message: 'Questions not found' } }
  }

  // Calculate score with support for different question types
  let correctAnswers = 0
  const totalQuestions = questions.length

  questions.forEach((question: any) => {
    const userAnswer = attemptData.answers[question.id]
    if (userAnswer === undefined || userAnswer === null) return // Skip unanswered questions
    
    let isCorrect = false
    
    // Handle different question types
    if (['fill_blank', 'essay'].includes(question.question_type)) {
      // Text-based answers - compare with correct_answer_text
      if (question.correct_answer_text) {
        if (question.question_type === 'fill_blank') {
          // For fill-in-the-blank, do case-insensitive comparison and trim whitespace
          isCorrect = String(userAnswer).toLowerCase().trim() === question.correct_answer_text.toLowerCase().trim()
        } else {
          // For essays, consider any non-empty answer as correct for now
          // (proper essay grading would require manual review or AI)
          isCorrect = String(userAnswer).trim().length > 0
        }
      }
    } else if (['matching', 'ordering'].includes(question.question_type)) {
      // Array-based answers - compare with JSON deserialized correct_answer_text
      if (question.correct_answer_text) {
        try {
          const correctAnswer = JSON.parse(question.correct_answer_text)
          // For arrays, compare length and contents
          if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
            isCorrect = correctAnswer.length === userAnswer.length && 
                       correctAnswer.every((val, index) => val === userAnswer[index])
          }
        } catch (err) {
          // If JSON parsing fails, mark as incorrect
          console.error('Error parsing correct answer JSON:', err)
          isCorrect = false
        }
      }
    } else {
      // Simple numeric answers (multiple_choice, single_choice, true_false)
      isCorrect = userAnswer === question.correct_answer
    }
    
    if (isCorrect) {
      correctAnswers++
    }
  })

  const score = Math.round((correctAnswers / totalQuestions) * 100)

  // Save the attempt
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      quiz_id: attemptData.quiz_id,
      user_id: attemptData.user_id,
      score,
      total_questions: totalQuestions,
      time_taken_seconds: attemptData.time_taken_seconds || 0,
      answers: attemptData.answers,
      completed_at: new Date().toISOString()
    })
    .select()
    .single()

  return { data, error }
}

export const enrollInCourse = async (courseId: string, userId: string) => {
  // First check if user is already enrolled
  const { data: existingEnrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .single()

  if (existingEnrollment) {
    return { data: existingEnrollment, error: null }
  }

  const { data, error } = await supabase
    .from('enrollments')
    .insert({
      course_id: courseId,
      user_id: userId,
      progress: 0,
      enrolled_at: new Date().toISOString()
    })
    .select()
    .single()

  return { data, error }
}

export const getUserProgress = async (userId: string) => {
  const [enrollments, attempts] = await Promise.all([
    supabase
      .from('enrollments')
      .select('*, courses!inner(*)')
      .eq('user_id', userId),
    supabase
      .from('quiz_attempts')
      .select('score')
      .eq('user_id', userId)
  ])

  const coursesEnrolled = enrollments.data?.length || 0
  const coursesCompleted = enrollments.data?.filter((e: any) => e.progress === 100).length || 0
  const quizzesTaken = attempts.data?.length || 0
  const averageScore = attempts.data?.length 
    ? Math.round(attempts.data.reduce((sum: number, attempt: any) => sum + attempt.score, 0) / attempts.data.length)
    : 0

  return {
    data: {
      courses_enrolled: coursesEnrolled,
      courses_completed: coursesCompleted,
      quizzes_taken: quizzesTaken,
      average_score: averageScore
    },
    error: enrollments.error || attempts.error
  }
}

export const getUserCourses = async (userId: string) => {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      courses!inner(*)
    `)
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false })

  const formattedData = data?.map((enrollment: any) => ({
    id: enrollment.courses.id,
    title: enrollment.courses.title,
    progress_percentage: enrollment.progress || 0,
    last_accessed: enrollment.enrolled_at
  }))

  return { data: formattedData, error }
}

export const getUserQuizAttempts = async (userId: string, limit?: number, page?: number) => {
  // Support pagination when page is provided
  if (page) {
    const pageLimit = limit || 10
    const from = (page - 1) * pageLimit
    const to = from + pageLimit - 1

    const { data, error, count } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quizzes!inner(title)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .range(from, to)

    const formattedData = data?.map((attempt: any) => ({
      id: attempt.id,
      quiz_title: attempt.quizzes.title,
      score: attempt.score,
      completed_at: attempt.completed_at,
      time_taken_minutes: Math.round((attempt.time_taken_seconds || 0) / 60)
    }))

    return { 
      data: formattedData, 
      error,
      pagination: {
        page,
        limit: pageLimit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageLimit),
        hasMore: (count || 0) > to + 1
      }
    }
  }

  // Original behavior for backward compatibility
  let query = supabase
    .from('quiz_attempts')
    .select(`
      *,
      quizzes!inner(title)
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  const formattedData = data?.map((attempt: any) => ({
    id: attempt.id,
    quiz_title: attempt.quizzes.title,
    score: attempt.score,
    completed_at: attempt.completed_at,
    time_taken_minutes: Math.round((attempt.time_taken_seconds || 0) / 60)
  }))

  return { data: formattedData, error }
}

export const updateUserProfile = async (userId: string, profile: any) => {
  const { data, error } = await supabase.auth.updateUser({
    data: profile
  })

  return { data, error }
}

export const getQuizResults = async (resultId: string) => {
  // Step 1: Fetch the quiz attempt and the related quiz title
  const { data: attempt, error: attemptError } = await supabase
    .from('quiz_attempts')
    .select(`
      *,
      quizzes (title)
    `)
    .eq('id', resultId)
    .single()

  if (attemptError || !attempt) {
    logger.error('Error fetching quiz attempt:', attemptError)
    return { data: null, error: attemptError }
  }

  // Step 2: Fetch all questions for the given quiz
  const { data: questions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', attempt.quiz_id)
    .order('order_index')

  if (questionsError || !questions) {
    logger.error('Error fetching quiz questions:', questionsError)
    return { data: null, error: questionsError }
  }

  // Step 3: Format the results, combining attempt data with question data
  const answers = questions.map((question: any) => {
    const userAnswerIndex = attempt.answers[question.id]
    const userAnswer = question.options[userAnswerIndex] ?? 'No answer'
    const correctAnswer = question.options[question.correct_answer]
    const isCorrect = userAnswerIndex === question.correct_answer

    return {
      question: question.question,
      user_answer: userAnswer,
      correct_answer: correctAnswer,
      is_correct: isCorrect,
      explanation: question.explanation
    }
  })

  const correctAnswersCount = answers.filter((a: any) => a.is_correct).length

  const formattedData = {
    id: attempt.id,
    quiz_title: attempt.quizzes.title,
    score: attempt.score,
    total_questions: questions.length,
    correct_answers: correctAnswersCount,
    time_taken_minutes: Math.round(attempt.time_taken_seconds / 60),
    completed_at: attempt.completed_at,
    answers
  }

  return { data: formattedData, error: null }
}
