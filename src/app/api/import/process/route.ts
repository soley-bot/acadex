import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, withServiceRole } from '@/lib/api-auth'
import { logger } from '@/lib/logger'
import type { QuestionImport } from '@/lib/import/validation'

// Import process API - fixed schema mapping
export const POST = withAdminAuth(async (request: NextRequest, user) => {
  try {
    logger.info('[Import Process] Request received', { adminUserId: user.id })
    
    const body = await request.json()
    const { quizId, questions, newQuizData } = body
    
    // Validate request
    if (!quizId && !newQuizData) {
      return NextResponse.json(
        { error: 'Either quizId or newQuizData is required' },
        { status: 400 }
      )
    }
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions provided' },
        { status: 400 }
      )
    }
    
    logger.info('[Import Process] Processing', { 
      questionCount: questions.length,
      mode: quizId ? 'existing' : 'new'
    })
    
    const result = await withServiceRole(user, async (serviceClient) => {
      let targetQuizId = quizId
      
      // Create new quiz if needed
      if (!targetQuizId && newQuizData) {
        logger.info('[Import Process] Creating new quiz', { title: newQuizData.title })
        
        const { data: newQuiz, error: quizError } = await serviceClient
          .from('quizzes')
          .insert({
            title: newQuizData.title,
            description: newQuizData.description || 'Imported quiz',
            category: newQuizData.category || 'General',
            difficulty: newQuizData.difficulty || 'medium',
            total_questions: questions.length,
            duration_minutes: newQuizData.duration_minutes || 30,
            passing_score: newQuizData.passing_score || 70,
            is_published: false, // Start as draft
            created_by: user.id
          })
          .select('id')
          .single()
        
        if (quizError || !newQuiz) {
          logger.error('[Import Process] Failed to create quiz', { error: quizError })
          throw new Error('Failed to create quiz')
        }
        
        targetQuizId = newQuiz.id
        logger.info('[Import Process] Quiz created', { quizId: targetQuizId })
      }
      
      // Verify quiz exists (for existing quiz mode)
      if (quizId) {
        const { data: quiz, error: quizCheckError } = await serviceClient
          .from('quizzes')
          .select('id, total_questions')
          .eq('id', quizId)
          .single()
        
        if (quizCheckError || !quiz) {
          logger.error('[Import Process] Quiz not found', { quizId, error: quizCheckError })
          throw new Error('Quiz not found')
        }
      }
      
      // Get current max order_index for the quiz
      const { data: maxOrderData } = await serviceClient
        .from('quiz_questions')
        .select('order_index')
        .eq('quiz_id', targetQuizId)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      let orderIndex = (maxOrderData?.order_index || 0) + 1
      
      logger.info('[Import Process] Starting from order_index', { orderIndex })
      
      // Transform questions to database format
      const insertData = questions
        .filter((q: any) => q.status === 'valid') // Only import valid questions
        .map((q: QuestionImport) => {
          const dbQuestion: any = {
            quiz_id: targetQuizId,
            question: q.question, // Fixed: was question_text
            question_type: q.type,
            explanation: q.explanation || null,
            points: q.points || 10,
            difficulty_level: q.difficulty || 'medium', // Fixed: was difficulty, now difficulty_level with default
            tags: q.tags ? q.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
            order_index: orderIndex++,
          }
          
          // Type-specific fields
          if (q.type === 'multiple_choice') {
            // Build options array from provided options
            const options = [
              q.option_a,
              q.option_b,
              q.option_c,
              q.option_d
            ].filter(Boolean) // Remove undefined/empty options
            
            dbQuestion.options = options
            dbQuestion.correct_answer = q.correct_answer
          } else if (q.type === 'true_false') {
            // True/False uses correct_answer (0 or 1) and standard options
            dbQuestion.options = ['True', 'False']
            dbQuestion.correct_answer = q.correct_answer_text?.toLowerCase() === 'true' ? 0 : 1
          } else if (q.type === 'fill_blank') {
            // Fill blank uses correct_answer_text and empty options
            dbQuestion.options = []
            dbQuestion.correct_answer = 0 // Required field, but not used for this type
            dbQuestion.correct_answer_text = q.correct_answer_text
          }
          
          return dbQuestion
        })
      
      logger.info('[Import Process] Inserting questions', { count: insertData.length })
      
      // Bulk insert questions
      const { data: insertedQuestions, error: insertError } = await serviceClient
        .from('quiz_questions')
        .insert(insertData)
        .select('id, question, question_type') // Fixed: was question_text
      
      if (insertError) {
        logger.error('[Import Process] Insert failed', { error: insertError })
        throw new Error(`Failed to insert questions: ${insertError.message}`)
      }
      
      // Update quiz total_questions count
      // First, get the current total_questions value
      const { data: currentQuiz } = await serviceClient
        .from('quizzes')
        .select('total_questions')
        .eq('id', targetQuizId)
        .single()

      const newTotal = (currentQuiz?.total_questions || 0) + (insertedQuestions?.length || 0)

      const { error: updateError } = await serviceClient
        .from('quizzes')
        .update({
          total_questions: newTotal,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetQuizId)
      
      if (updateError) {
        logger.warn('[Import Process] Failed to update quiz count', { error: updateError })
        // Non-critical error, continue
      }
      
      logger.info('[Import Process] Success', { 
        quizId: targetQuizId,
        imported: insertedQuestions?.length || 0
      })
      
      return {
        quizId: targetQuizId,
        imported: insertedQuestions?.length || 0,
        questions: insertedQuestions
      }
    })
    
    return NextResponse.json({
      success: true,
      ...result
    })
    
  } catch (error: any) {
    logger.error('[Import Process] Error', { 
      error: error.message,
      stack: error.stack
    })
    
    return NextResponse.json(
      {
        error: error.message || 'Import failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
})
