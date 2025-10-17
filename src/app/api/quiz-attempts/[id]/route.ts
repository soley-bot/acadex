/**
 * Quiz Attempt Details API Endpoint
 * Fetches a specific quiz attempt with all details for results page
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAuthenticatedClient, verifyAuthentication } from '@/lib/api-auth'
import { logger } from '@/lib/logger'

// Input validation helper
function validateAttemptId(attemptId: string | undefined): string {
  if (!attemptId || typeof attemptId !== 'string') {
    throw new Error('Invalid attempt ID')
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(attemptId)) {
    throw new Error('Invalid attempt ID format')
  }

  return attemptId
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let rawAttemptId: string | undefined

  try {
    // Resolve params
    const resolvedParams = await params
    rawAttemptId = resolvedParams.id
    const attemptId = validateAttemptId(rawAttemptId)

    // Create authenticated client
    const supabase = createAuthenticatedClient(request)

    // Verify authentication
    let user
    try {
      user = await verifyAuthentication(supabase)
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Fetch quiz attempt with quiz info and questions
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .select(`
        id,
        quiz_id,
        user_id,
        score,
        total_questions,
        time_taken_seconds,
        answers,
        passed,
        percentage_score,
        attempt_number,
        completed_at,
        quizzes (
          id,
          title,
          description,
          category,
          difficulty
        )
      `)
      .eq('id', attemptId)
      .single()

    if (attemptError || !attempt) {
      return NextResponse.json(
        { error: 'Quiz attempt not found' },
        { status: 404 }
      )
    }

    // Verify user owns this attempt or is admin
    if (attempt.user_id !== user.id) {
      // Check if user is admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!userData || userData.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
    }

    // Fetch questions with correct answers to build detailed results
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select(`
        id,
        question,
        question_type,
        options,
        correct_answer,
        correct_answer_text,
        correct_answer_json,
        explanation,
        order_index
      `)
      .eq('quiz_id', attempt.quiz_id)
      .order('order_index')

    if (questionsError) {
      logger.error('Failed to fetch questions for attempt', {
        error: questionsError.message,
        attemptId
      })
    }

    // Build detailed answer array for results display
    const detailedAnswers = questions?.map(question => {
      const userAnswer = attempt.answers[question.id]
      let isCorrect = false
      let correctAnswerDisplay = ''

      // Determine correct answer based on question type
      if (question.question_type === 'multiple_choice' || question.question_type === 'single_choice') {
        isCorrect = userAnswer === question.correct_answer
        const options = question.options as string[]
        correctAnswerDisplay = options[question.correct_answer] || String(question.correct_answer)
      } else if (question.question_type === 'true_false') {
        isCorrect = userAnswer === question.correct_answer
        correctAnswerDisplay = question.correct_answer === 0 ? 'True' : 'False'
      } else if (question.question_type === 'fill_blank') {
        const correctAnswer = String(question.correct_answer_text || question.correct_answer || '').toLowerCase().trim()
        const userAnswerStr = String(userAnswer || '').toLowerCase().trim()
        isCorrect = userAnswerStr === correctAnswer
        correctAnswerDisplay = question.correct_answer_text || String(question.correct_answer)
      }

      return {
        question: question.question,
        user_answer: String(userAnswer || 'No answer'),
        correct_answer: correctAnswerDisplay,
        is_correct: isCorrect,
        explanation: question.explanation
      }
    }) || []

    // Calculate correct answers count
    const correctAnswersCount = detailedAnswers.filter(a => a.is_correct).length

    // Format response for results page
    const formattedResult = {
      id: attempt.id,
      quiz_title: (attempt.quizzes as any)?.title || 'Unknown Quiz',
      score: attempt.score,
      total_questions: attempt.total_questions,
      correct_answers: correctAnswersCount,
      time_taken_minutes: Math.ceil(attempt.time_taken_seconds / 60),
      completed_at: attempt.completed_at,
      percentage_score: attempt.percentage_score,
      passed: attempt.passed,
      attempt_number: attempt.attempt_number,
      answers: detailedAnswers
    }

    logger.info('Quiz attempt details fetched', {
      attemptId,
      userId: user.id,
      quizId: attempt.quiz_id
    })

    return NextResponse.json({
      success: true,
      data: formattedResult
    })

  } catch (error: any) {
    logger.error('Quiz attempt details API error', {
      error: error.message,
      attemptId: rawAttemptId
    })

    return NextResponse.json(
      { error: error.message || 'Failed to fetch quiz attempt' },
      { status: 500 }
    )
  }
}
