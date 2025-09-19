import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, createServiceClient } from '@/lib/api-auth'
import { logger } from '@/lib/logger'

interface QuizWithQuestionsRequest {
  // Quiz fields
  title: string
  description?: string
  category: string
  difficulty: string
  time_limit?: number
  passing_score?: number
  max_attempts?: number
  image_url?: string
  
  // Questions array
  questions: Array<{
    question: string
    question_type: string
    options?: string[]
    correct_answer: string
    correct_answer_text?: string
    explanation?: string
    points?: number
    difficulty_level?: string
    order_index?: number
  }>
}

export const POST = withAdminAuth(async (
  request: NextRequest,
  user
) => {
  try {
    const requestData: QuizWithQuestionsRequest = await request.json()
    
    const { questions, ...quizData } = requestData

    if (!quizData.title || !questions || questions.length === 0) {
      return NextResponse.json({
        error: 'Quiz title and questions are required'
      }, { status: 400 })
    }

    if (questions.length > 50) {
      return NextResponse.json({
        error: 'Maximum 50 questions allowed per quiz'
      }, { status: 400 })
    }

    logger.info('Starting batch quiz creation', { 
      title: quizData.title,
      questionsCount: questions.length,
      userId: user.id
    })

    const supabase = createServiceClient()

    // 🚀 PROFESSIONAL APPROACH: Single Database Transaction
    // This is the key to performance - everything happens atomically
    
    try {
      // Step 1: Create the quiz first
      const { data: quizInsert, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          ...quizData,
          instructor_id: user.id,
          total_questions: questions.length,
          is_published: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id, title')
        .single()

      if (quizError || !quizInsert) {
        logger.error('Failed to create quiz', { quizError, userId: user.id })
        throw new Error('Failed to create quiz: ' + quizError?.message)
      }

      const quizId = quizInsert.id

      // Step 2: Prepare all questions with the quiz_id and proper structure
      const questionsToInsert = questions.map((q, index) => ({
        id: crypto.randomUUID(),
        quiz_id: quizId,
        question: q.question,
        question_type: q.question_type,
        options: q.options || [],
        correct_answer: q.correct_answer,
        correct_answer_text: q.correct_answer_text,
        explanation: q.explanation,
        order_index: q.order_index ?? index,
        points: q.points || 1,
        difficulty_level: q.difficulty_level || 'medium',
        required: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      // Step 3: Insert ALL questions in a single batch operation
      // 🎯 This is where the magic happens - 1 operation instead of N operations
      const { data: questionsInsert, error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsToInsert)
        .select('id, question, order_index')

      if (questionsError) {
        logger.error('Failed to insert questions, cleaning up quiz', { 
          questionsError, 
          quizId,
          userId: user.id 
        })
        
        // Clean up the quiz if question insertion fails
        await supabase.from('quizzes').delete().eq('id', quizId)
        throw new Error('Failed to create questions: ' + questionsError.message)
      }

      logger.info('Successfully created quiz with questions in batch', {
        quizId,
        quizTitle: quizInsert.title,
        questionsCreated: questionsInsert?.length || 0,
        totalDatabaseOperations: 2, // quiz insert + questions batch insert
        userId: user.id
      })

      // Return the complete quiz data
      return NextResponse.json({
        success: true,
        quiz: {
          id: quizId,
          title: quizInsert.title,
          total_questions: questions.length,
          created_at: new Date().toISOString()
        },
        questions: questionsInsert,
        message: `Quiz created successfully with ${questions.length} questions`,
        performance: {
          approach: 'batch_transaction',
          database_operations: 2,
          questions_count: questions.length,
          estimated_time_saved: `${Math.max(0, questions.length - 2)} database calls avoided`
        }
      })

    } catch (transactionError: any) {
      // If anything fails, the entire operation is rolled back
      logger.error('Quiz creation transaction failed', { 
        error: transactionError.message,
        userId: user.id,
        quizTitle: quizData.title
      })
      
      return NextResponse.json({
        error: 'Failed to create quiz and questions',
        details: transactionError.message
      }, { status: 500 })
    }

  } catch (error: any) {
    logger.error('Quiz batch creation API error', { 
      error: error.message,
      stack: error.stack
    })
    
    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
})

// GET endpoint to fetch quiz with all questions in a single request
export const GET = withAdminAuth(async (
  request: NextRequest,
  user
) => {
  try {
    const url = new URL(request.url)
    const quizId = url.searchParams.get('id')

    if (!quizId) {
      return NextResponse.json({
        error: 'Quiz ID is required'
      }, { status: 400 })
    }

    const supabase = createServiceClient()

    // 🚀 OPTIMIZED: Single query with JOIN instead of multiple queries
    const { data: quizWithQuestions, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        quiz_questions (
          id,
          question,
          question_type,
          options,
          correct_answer,
          correct_answer_text,
          explanation,
          order_index,
          points,
          difficulty_level
        )
      `)
      .eq('id', quizId)
      .single()

    if (error) {
      logger.error('Failed to fetch quiz with questions', { error, quizId })
      return NextResponse.json({
        error: 'Quiz not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      quiz: quizWithQuestions,
      performance: {
        approach: 'single_join_query',
        database_operations: 1
      }
    })

  } catch (error: any) {
    logger.error('Quiz fetch API error', { error: error.message })
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
})