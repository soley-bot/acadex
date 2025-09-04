import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, createServiceClient } from '@/lib/api-auth'
import { QuizQuestion } from '@/lib/supabase'
import { logger } from '@/lib/logger'

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

    const { questions } = await request.json()

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({
        error: 'Questions array is required'
      }, { status: 400 })
    }

    // Create admin service client
    const supabase = createServiceClient()

    // First, delete existing questions for this quiz
    const { error: deleteError } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('quiz_id', quizId)

    if (deleteError) {
      logger.error('Failed to delete existing questions', { deleteError, quizId })
      return NextResponse.json({
        error: 'Failed to delete existing questions'
      }, { status: 500 })
    }

    // Insert new questions
    const { data: insertedQuestions, error: insertError } = await supabase
      .from('quiz_questions')
      .insert(questions)
      .select()

    if (insertError) {
      logger.error('Failed to insert questions', { insertError, quizId, questionsCount: questions.length })
      return NextResponse.json({
        error: 'Failed to save questions'
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
      insertedCount: insertedQuestions?.length 
    })

    return NextResponse.json({
      success: true,
      questions: insertedQuestions,
      message: `${questions.length} questions saved successfully`
    })

  } catch (error) {
    logger.error('Questions save API error', { error })
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
})

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
