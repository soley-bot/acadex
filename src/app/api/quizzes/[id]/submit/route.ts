/**
 * Quiz Submission API Endpoint
 * Handles quiz submission and scoring on the server side
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAuthenticatedClient, verifyAuthentication } from '@/lib/api-auth'
import { logger } from '@/lib/logger'

// Input validation helper
function validateQuizId(quizId: string | undefined): string {
  if (!quizId || typeof quizId !== 'string') {
    throw new Error('Invalid quiz ID')
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(quizId)) {
    throw new Error('Invalid quiz ID format')
  }

  return quizId
}

function validateSubmissionData(data: any) {
  const { answers, time_taken } = data

  if (!answers || typeof answers !== 'object') {
    throw new Error('Invalid answers format')
  }

  // Limit answers object size
  const answersString = JSON.stringify(answers)
  if (answersString.length > 100000) {
    throw new Error('Answers data too large')
  }

  if (time_taken !== undefined && (typeof time_taken !== 'number' || time_taken < 0)) {
    throw new Error('Invalid time_taken value')
  }

  return { answers, time_taken }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let rawQuizId: string | undefined

  try {
    // Resolve params
    const resolvedParams = await params
    rawQuizId = resolvedParams.id
    const quizId = validateQuizId(rawQuizId)

    // Parse and validate request body
    const requestData = await request.json()
    const { answers, time_taken } = validateSubmissionData(requestData)

    // Create authenticated client
    const supabase = createAuthenticatedClient(request)

    // Verify authentication
    let user
    try {
      user = await verifyAuthentication(supabase)
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Fetch quiz and questions with correct answers
    const [quizResult, questionsResult] = await Promise.all([
      supabase
        .from('quizzes')
        .select('id, title, is_published, passing_score, max_attempts, time_limit_minutes')
        .eq('id', quizId)
        .eq('is_published', true)
        .single(),

      supabase
        .from('quiz_questions')
        .select('id, question_type, correct_answer, points, options')
        .eq('quiz_id', quizId)
        .order('order_index')
    ])

    if (quizResult.error || !quizResult.data) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found or not available' },
        { status: 404 }
      )
    }

    if (questionsResult.error) {
      throw new Error('Failed to fetch quiz questions')
    }

    const quiz = quizResult.data
    const questions = questionsResult.data || []

    // Get current attempt number
    const { data: existingAttempts } = await supabase
      .from('quiz_attempts')
      .select('id, attempt_number', { count: 'exact' })
      .eq('quiz_id', quizId)
      .eq('user_id', user.id)
      .order('attempt_number', { ascending: false })
      .limit(1)

    const attemptNumber = existingAttempts && existingAttempts.length > 0
      ? (existingAttempts[0].attempt_number || 0) + 1
      : 1

    // Check attempt limit
    if (quiz.max_attempts && quiz.max_attempts > 0 && attemptNumber > quiz.max_attempts) {
      return NextResponse.json(
        { success: false, error: 'Maximum attempts reached' },
        { status: 403 }
      )
    }

    // Calculate score on server side
    let totalScore = 0
    let earnedScore = 0

    questions.forEach(question => {
      const points = question.points || 1
      totalScore += points

      const userAnswer = answers[question.id]
      let isCorrect = false

      // Check answer based on question type
      if (question.question_type === 'multiple_choice' || question.question_type === 'single_choice') {
        isCorrect = userAnswer === question.correct_answer
      } else if (question.question_type === 'true_false') {
        isCorrect = userAnswer === question.correct_answer
      } else if (question.question_type === 'fill_blank') {
        // Case-insensitive comparison for fill in the blank
        const correctAnswer = String((question as any).correct_answer_text || question.correct_answer || '').toLowerCase().trim()
        const userAnswerStr = String(userAnswer || '').toLowerCase().trim()
        isCorrect = userAnswerStr === correctAnswer
      }
      // Essay questions need manual grading, so isCorrect stays false

      if (isCorrect) {
        earnedScore += points
      }
    })

    const percentageScore = totalScore > 0 ? (earnedScore / totalScore) * 100 : 0
    const passed = quiz.passing_score ? percentageScore >= quiz.passing_score : true

    // Save quiz attempt
    const { data: result, error: resultError } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quizId,
        user_id: user.id,
        score: earnedScore,
        total_questions: questions.length,
        time_taken_seconds: time_taken || 0,
        answers: answers,
        passed: passed,
        percentage_score: percentageScore,
        attempt_number: attemptNumber
      })
      .select()
      .single()

    if (resultError) {
      logger.error('Failed to save quiz attempt', {
        error: resultError.message,
        quizId,
        userId: user.id
      })
      throw new Error('Failed to save quiz attempt')
    }

    // Mark progress as completed
    await supabase
      .from('quiz_progress')
      .update({ is_completed: true })
      .eq('quiz_id', quizId)
      .eq('user_id', user.id)

    logger.info('Quiz submitted successfully', {
      quizId,
      userId: user.id,
      score: earnedScore,
      totalPoints: totalScore,
      percentageScore,
      passed,
      attemptNumber
    })

    return NextResponse.json({
      success: true,
      result: {
        id: result.id,
        score: earnedScore,
        total_questions: questions.length,
        percentage_score: percentageScore,
        passed: passed,
        attempt_number: attemptNumber
      }
    })

  } catch (error: any) {
    logger.error('Quiz submission API error', {
      error: error.message,
      quizId: rawQuizId
    })

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit quiz' },
      { status: 500 }
    )
  }
}