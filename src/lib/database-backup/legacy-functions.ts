import { supabase } from '../supabase'
import { logger } from '../logger'
import { courseAPI } from './courses'

/**
 * Legacy Functions Module
 * 
 * Contains additional functions from the original database-backup.ts file
 * that provide backward compatibility and convenience functions.
 * These functions use the modular APIs internally.
 */

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
      // Complex answers - compare with correct_answer_json
      if (question.correct_answer_json) {
        try {
          const correctAnswer = question.correct_answer_json
          
          if (question.question_type === 'ordering') {
            // For ordering: user answer is {originalIndex: position}, correct answer should be in same format
            // or we convert from array format to position format
            let correctPositions: Record<string, number>
            
            if (Array.isArray(correctAnswer)) {
              // Convert array format ["word1", "word2", "word3"] to position format
              correctPositions = {}
              const options = Array.isArray(question.options) ? question.options : JSON.parse(question.options)
              correctAnswer.forEach((word, position) => {
                const originalIndex = options.findIndex((opt: string) => opt === word)
                if (originalIndex !== -1) {
                  correctPositions[originalIndex] = position + 1
                }
              })
            } else {
              // Already in position format
              correctPositions = correctAnswer
            }
            
            // Compare user answer with correct positions
            if (typeof userAnswer === 'object' && userAnswer !== null) {
              const userPositions = userAnswer as Record<string, number>
              isCorrect = Object.keys(correctPositions).length === Object.keys(userPositions).length &&
                         Object.keys(correctPositions).every(key => correctPositions[key] === userPositions[key])
            }
          } else if (question.question_type === 'matching') {
            // For matching: similar logic but for pairs
            if (typeof userAnswer === 'object' && userAnswer !== null && typeof correctAnswer === 'object') {
              const userMatches = userAnswer as Record<string, number>
              const correctMatches = correctAnswer as Record<string, number>
              isCorrect = Object.keys(correctMatches).length === Object.keys(userMatches).length &&
                         Object.keys(correctMatches).every(key => correctMatches[key] === userMatches[key])
            }
          }
        } catch (err) {
          // If parsing fails, mark as incorrect
          console.error('Error processing correct_answer_json:', err)
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

  const percentageScore = Math.round((correctAnswers / totalQuestions) * 100)

  // Save the attempt
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      quiz_id: attemptData.quiz_id,
      user_id: attemptData.user_id,
      score: correctAnswers, // Raw number of correct answers
      total_questions: totalQuestions,
      percentage_score: percentageScore, // Percentage score
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
  try {
    console.log('getUserProgress called with userId:', userId)
    
    // Check if we have a valid session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('Current session:', { user: session?.user?.id, error: sessionError })
    
    if (!session?.user) {
      console.error('No authenticated user found')
      return { 
        data: {
          courses_enrolled: 0,
          courses_completed: 0,
          quizzes_taken: 0,
          average_score: 0
        }, 
        error: new Error('Not authenticated') 
      }
    }
    
    // Test a simple query first
    console.log('Testing simple enrollments query...')
    const enrollments = await supabase
      .from('enrollments')
      .select('id, user_id, course_id, progress')
      .eq('user_id', userId)
    
    console.log('Enrollments result:', { 
      data: enrollments.data, 
      error: enrollments.error,
      count: enrollments.data?.length 
    })
    
    if (enrollments.error) {
      console.error('Enrollments query failed. Full error object:', enrollments.error)
      console.error('Error stringified:', JSON.stringify(enrollments.error))
      
      // Return basic data with fallback
      return { 
        data: {
          courses_enrolled: 0,
          courses_completed: 0,
          quizzes_taken: 0,
          average_score: 100 // Fallback to show something in UI
        }, 
        error: enrollments.error 
      }
    }

    // Test quiz attempts query
    console.log('Testing simple quiz attempts query...')
    const attempts = await supabase
      .from('quiz_attempts')
      .select('id, user_id, score, total_questions')
      .eq('user_id', userId)
    
    console.log('Quiz attempts result:', { 
      data: attempts.data, 
      error: attempts.error,
      count: attempts.data?.length 
    })
    
    if (attempts.error) {
      console.error('Quiz attempts query failed. Full error object:', attempts.error)
      console.error('Error stringified:', JSON.stringify(attempts.error))
      
      // Return data from enrollments but with quiz fallback
      return { 
        data: {
          courses_enrolled: enrollments.data?.length || 0,
          courses_completed: 0,
          quizzes_taken: 0,
          average_score: 100 // Fallback to show something in UI
        }, 
        error: attempts.error 
      }
    }

    // If we got here, both queries succeeded
    console.log('Both queries succeeded! Processing data...')
    
    // Calculate basic stats
    const coursesEnrolled = enrollments.data?.length || 0
    const coursesCompleted = enrollments.data?.filter((e: any) => e.progress === 100).length || 0
    const quizzesTaken = attempts.data?.length || 0
    
    // Calculate average percentage
    let averageScore = 0
    if (attempts.data?.length) {
      console.log('Processing quiz attempts for average:', attempts.data)
      
      const validScores = attempts.data
        .filter((attempt: any) => attempt.score !== null && attempt.total_questions > 0)
        .map((attempt: any) => {
          // Calculate percentage from score and total_questions
          const percentage = Math.round((attempt.score / attempt.total_questions) * 100)
          const cappedPercentage = Math.min(percentage, 100) // Cap at 100%
          
          console.log(`Quiz attempt: score=${attempt.score}, total=${attempt.total_questions}, percentage=${cappedPercentage}%`)
          return cappedPercentage
        })
      
      if (validScores.length > 0) {
        averageScore = Math.round(validScores.reduce((sum: number, score: number) => sum + score, 0) / validScores.length)
        console.log(`Calculated average: ${averageScore}% from ${validScores.length} attempts`)
      }
    }

    const result = {
      data: {
        courses_enrolled: coursesEnrolled,
        courses_completed: coursesCompleted,
        quizzes_taken: quizzesTaken,
        average_score: averageScore
      },
      error: null
    }
    
    console.log('getUserProgress final result:', result)
    return result
    
  } catch (error) {
    console.error('getUserProgress caught error:', error)
    console.error('Error type:', typeof error)
    console.error('Error stringified:', JSON.stringify(error))
    
    return { 
      data: {
        courses_enrolled: 0,
        courses_completed: 0,
        quizzes_taken: 0,
        average_score: 0
      }, 
      error 
    }
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

  // Calculate progress for each enrollment
  const formattedData = []
  for (const enrollment of data || []) {
    // Get total lessons for this course
    const { data: totalLessons } = await supabase
      .from('course_lessons')
      .select('id')
      .eq('course_id', enrollment.course_id)

    // Get completed lessons for this user and course
    const { data: completedLessons } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('completed', true)
      .in('lesson_id', (totalLessons || []).map((lesson: any) => lesson.id))

    const totalLessonsCount = totalLessons?.length || 0
    const completedLessonsCount = completedLessons?.length || 0
    const progressPercentage = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0

    formattedData.push({
      id: enrollment.courses.id,
      title: enrollment.courses.title,
      progress_percentage: progressPercentage,
      last_accessed: enrollment.last_accessed || enrollment.enrolled_at
    })
  }

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
        quizzes!inner(id, title, category, difficulty, total_questions)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .range(from, to)

    const formattedData = data?.map((attempt: any) => ({
      id: attempt.id,
      quiz_id: attempt.quiz_id,
      quiz_title: attempt.quizzes.title,
      score: attempt.score,
      total_questions: attempt.total_questions || attempt.quizzes.total_questions || 0,
      completed_at: attempt.completed_at,
      time_taken_minutes: Math.round((attempt.time_taken_seconds || 0) / 60),
      category: attempt.quizzes.category,
      difficulty: attempt.quizzes.difficulty,
      percentage: (attempt.total_questions || attempt.quizzes.total_questions) > 0 
        ? Math.min(Math.round((attempt.score / (attempt.total_questions || attempt.quizzes.total_questions)) * 100), 100)
        : 0
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
      quizzes!inner(id, title, category, difficulty, total_questions)
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  const formattedData = data?.map((attempt: any) => ({
    id: attempt.id,
    quiz_id: attempt.quiz_id,
    quiz_title: attempt.quizzes.title,
    score: attempt.score,
    total_questions: attempt.total_questions || attempt.quizzes.total_questions || 0,
    completed_at: attempt.completed_at,
    time_taken_minutes: Math.round((attempt.time_taken_seconds || 0) / 60),
    category: attempt.quizzes.category,
    difficulty: attempt.quizzes.difficulty,
    percentage: (attempt.total_questions || attempt.quizzes.total_questions) > 0 
      ? Math.min(Math.round((attempt.score / (attempt.total_questions || attempt.quizzes.total_questions)) * 100), 100)
      : 0
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
    const userAnswerData = attempt.answers[question.id]
    
    // Handle different question types properly
    let userAnswer: string
    let correctAnswer: string
    let isCorrect: boolean
    
    if (question.question_type === 'ordering') {
      // For ordering questions: user answer is {originalIndex: position}, need to convert to ordered array
      if (userAnswerData && typeof userAnswerData === 'object' && !Array.isArray(userAnswerData)) {
        // Convert position object back to ordered array
        const options = Array.isArray(question.options) ? question.options : JSON.parse(question.options || '[]')
        const userPositions = userAnswerData as Record<string, number>
        
        // Create array based on positions
        const orderedArray: string[] = []
        Object.keys(userPositions).forEach(originalIndex => {
          const position = userPositions[originalIndex]
          const word = options[parseInt(originalIndex)]
          if (word && position !== undefined && position > 0) {
            orderedArray[position - 1] = word
          }
        })
        
        userAnswer = orderedArray.filter(Boolean).length > 0 ? orderedArray.filter(Boolean).join(' → ') : 'No answer'
      } else {
        // Fallback for array format or empty
        const userArray = Array.isArray(userAnswerData) ? userAnswerData : []
        userAnswer = userArray.length > 0 ? userArray.join(' → ') : 'No answer'
      }
      
      const correctArray = question.correct_answer_json || []
      correctAnswer = Array.isArray(correctArray) ? correctArray.join(' → ') : 'No correct answer set'
      
      // Check correctness using the same logic as submitQuizAttempt
      let correctPositions: Record<string, number> = {}
      if (Array.isArray(correctArray)) {
        const options = Array.isArray(question.options) ? question.options : JSON.parse(question.options || '[]')
        correctArray.forEach((word, position) => {
          const originalIndex = options.findIndex((opt: string) => opt === word)
          if (originalIndex !== -1) {
            correctPositions[originalIndex] = position + 1
          }
        })
      }
      
      if (userAnswerData && typeof userAnswerData === 'object' && !Array.isArray(userAnswerData)) {
        const userPositions = userAnswerData as Record<string, number>
        isCorrect = Object.keys(correctPositions).length === Object.keys(userPositions).length &&
                   Object.keys(correctPositions).every(key => correctPositions[key] === userPositions[key])
      } else {
        isCorrect = false
      }
      
    } else if (question.question_type === 'matching') {
      // For matching questions: user answer is {leftIndex: rightIndex}
      if (userAnswerData && typeof userAnswerData === 'object' && !Array.isArray(userAnswerData)) {
        const userMatches = userAnswerData as Record<string, number>
        const matchCount = Object.keys(userMatches).length
        userAnswer = matchCount > 0 ? `${matchCount} matches made` : 'No answer'
      } else {
        userAnswer = 'No answer'
      }
      
      const correctArray = question.correct_answer_json || []
      correctAnswer = Array.isArray(correctArray) && correctArray.length > 0 ? 'Correct matching pairs defined' : 'No correct answer set'
      
      // Check correctness using the same logic as submitQuizAttempt
      if (userAnswerData && typeof userAnswerData === 'object' && !Array.isArray(userAnswerData) && 
          question.correct_answer_json && typeof question.correct_answer_json === 'object') {
        const userMatches = userAnswerData as Record<string, number>
        const correctMatches = question.correct_answer_json as Record<string, number>
        isCorrect = Object.keys(correctMatches).length === Object.keys(userMatches).length &&
                   Object.keys(correctMatches).every(key => correctMatches[key] === userMatches[key])
      } else {
        isCorrect = false
      }
      
    } else if (['fill_blank', 'essay'].includes(question.question_type)) {
      // For text-based questions
      userAnswer = userAnswerData || 'No answer'
      correctAnswer = question.correct_answer_text || 'No correct answer set'
      isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
      
    } else {
      // For multiple choice, true/false (index-based)
      const userAnswerIndex = userAnswerData
      userAnswer = question.options[userAnswerIndex] ?? 'No answer'
      correctAnswer = question.options[question.correct_answer] ?? 'No correct answer set'
      isCorrect = userAnswerIndex === question.correct_answer
    }

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
    score: correctAnswersCount, // Use calculated correct answers count
    total_questions: questions.length,
    correct_answers: correctAnswersCount,
    time_taken_minutes: Math.round(attempt.time_taken_seconds / 60),
    completed_at: attempt.completed_at,
    answers
  }

  return { data: formattedData, error: null }
}