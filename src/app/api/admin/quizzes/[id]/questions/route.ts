import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, createServiceClient } from '@/lib/api-auth'
import { QuizQuestion } from '@/lib/supabase'
import { logger } from '@/lib/logger'

// Simple in-memory lock to prevent concurrent saves on the same quiz
const saveLocks = new Map<string, Promise<any>>()

export const POST = withAdminAuth(async (
  request: NextRequest,
  user
) => {
  try {
    const url = new URL(request.url)
    const quizId = url.pathname.split('/').slice(-2, -1)[0] // Get quiz id from path
    
    if (!quizId) {
      return NextResponse.json({
        error: 'Quiz ID is required'
      }, { status: 400 })
    }

    // Check if there's already a save operation in progress for this quiz
    if (saveLocks.has(quizId)) {
      logger.warn('Save operation already in progress', { quizId })
      await saveLocks.get(quizId) // Wait for the existing operation to complete
    }

    // Create a promise for this save operation
    const savePromise = performQuestionSave(request, quizId)
    saveLocks.set(quizId, savePromise)

    try {
      const result = await savePromise
      return result
    } finally {
      // Always clean up the lock
      saveLocks.delete(quizId)
    }

  } catch (error) {
    logger.error('Questions save API error', { error })
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
})

async function performQuestionSave(request: NextRequest, quizId: string) {
  const { questions } = await request.json()

  if (!questions || !Array.isArray(questions)) {
    return NextResponse.json({
      error: 'Questions array is required'
    }, { status: 400 })
  }

  // Create admin service client
  const supabase = createServiceClient()

  // Use a transaction-like approach with more robust error handling
  // First, ensure we have a clean slate by deleting existing questions
  let deleteAttempts = 0
  const maxDeleteAttempts = 3
  
  while (deleteAttempts < maxDeleteAttempts) {
    const { error: deleteError } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('quiz_id', quizId)

    if (!deleteError) {
      logger.info('Successfully cleared existing questions', { quizId, attempt: deleteAttempts + 1 })
      break
    }
    
    deleteAttempts++
    logger.warn('Delete attempt failed', { deleteError, quizId, attempt: deleteAttempts })
    
    if (deleteAttempts >= maxDeleteAttempts) {
      logger.error('Failed to clear existing questions after multiple attempts', { deleteError, quizId })
      return NextResponse.json({
        error: 'Failed to clear existing questions',
        details: deleteError.message
      }, { status: 500 })
    }
    
    // Wait a bit before retrying
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // Prepare questions with guaranteed fresh IDs and clean order_index
  const questionsWithIds = questions.map((q: any, index: number) => ({
    // Always generate new ID to avoid conflicts
    id: crypto.randomUUID(),
    quiz_id: quizId,
    question: q.question,
    question_type: q.question_type,
    options: q.options,
    correct_answer: q.correct_answer,
    correct_answer_text: q.correct_answer_text,
    correct_answer_json: q.correct_answer_json,
    explanation: q.explanation,
    order_index: index,
    points: q.points,
    difficulty_level: q.difficulty_level,
    image_url: q.image_url,
    audio_url: q.audio_url,
    video_url: q.video_url,
    tags: q.tags,
    time_limit_seconds: q.time_limit_seconds,
    required: q.required,
    randomize_options: q.randomize_options,
    partial_credit: q.partial_credit,
    feedback_correct: q.feedback_correct,
    feedback_incorrect: q.feedback_incorrect,
    hint: q.hint
  }))

  const { data: insertedQuestions, error: insertError } = await supabase
    .from('quiz_questions')
    .insert(questionsWithIds)
    .select()

  if (insertError) {
    logger.error('Failed to insert questions', { insertError, quizId, questionsCount: questions.length })
    return NextResponse.json({
      error: 'Failed to save questions',
      details: insertError.message
    }, { status: 500 })
  }

  // Update the quiz total_questions count
  const { error: updateError } = await supabase
    .from('quizzes')
    .update({ total_questions: questions.length })
    .eq('id', quizId)

  if (updateError) {
    logger.warn('Failed to update quiz total_questions', { updateError, quizId })
  }

  logger.info('Questions saved successfully', { 
    quizId, 
    questionsCount: questions.length,
    insertedCount: insertedQuestions?.length,
    deletedCount: 'all_existing'
  })

  return NextResponse.json({
    success: true,
    questions: insertedQuestions,
    message: `${questions.length} questions saved successfully`
  })
}

export const GET = withAdminAuth(async (
  request: NextRequest,
  user
) => {
  try {
    const url = new URL(request.url)
    const quizId = url.pathname.split('/').slice(-2, -1)[0] // Get quiz id from path
    
    if (!quizId) {
      return NextResponse.json({
        error: 'Quiz ID is required'
      }, { status: 400 })
    }

    // Create admin service client
    const supabase = createServiceClient()

    // Fetch questions for this quiz
    const { data: questions, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_index')

    if (error) {
      logger.error('Failed to fetch questions', { error, quizId })
      return NextResponse.json({
        error: 'Failed to fetch questions'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      questions: questions || []
    })

  } catch (error) {
    logger.error('Questions fetch API error', { error })
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
})
