import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/api-auth'
import { logger } from '@/lib/logger'

// Input validation helper
function validateQuizId(quizId: string | undefined): string {
  if (!quizId || typeof quizId !== 'string') {
    throw new Error('Invalid quiz ID')
  }
  
  // Validate UUID format to prevent injection
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(quizId)) {
    throw new Error('Invalid quiz ID format')
  }
  
  return quizId
}

// GET - Fetch single public quiz with questions for taking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Properly await params for Next.js 14+
    const { id: rawQuizId } = await params
    const quizId = validateQuizId(rawQuizId)

    const supabase = createServiceClient()
    logger.info('Public quiz details fetch requested', { quizId })

    // Fetch quiz and questions in parallel - optimized for quiz taking
    // CRITICAL FIX: Remove correct_answer from public API response
    const [quizResult, questionsResult] = await Promise.all([
      supabase
        .from('quizzes')
        .select(`
          id,
          title,
          description,
          category,
          difficulty,
          duration_minutes,
          total_questions,
          passing_score,
          max_attempts,
          image_url,
          is_published,
          instructions,
          tags,
          reading_passage,
          passage_title,
          passage_source,
          passage_audio_url,
          word_count,
          estimated_read_time,
          time_limit_minutes
        `)
        .eq('id', quizId)
        .eq('is_published', true) // Only published quizzes for public access
        .single(),
      
      supabase
        .from('quiz_questions')
        .select(`
          id,
          question,
          question_type,
          options,
          explanation,
          order_index,
          points,
          difficulty_level,
          image_url,
          audio_url,
          video_url,
          time_limit_seconds
        `)
        .eq('quiz_id', quizId)
        .order('order_index')
    ])

    if (quizResult.error) {
      if (quizResult.error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Quiz not found or not published' }, { status: 404 })
      }
      throw new Error(`Quiz fetch failed: ${quizResult.error.message}`)
    }

    if (questionsResult.error) {
      throw new Error(`Questions fetch failed: ${questionsResult.error.message}`)
    }

    const quiz = quizResult.data
    const questions = questionsResult.data || []

    // Validate quiz is available for taking
    if (!quiz.is_published) {
      return NextResponse.json({ error: 'Quiz is not published' }, { status: 404 })
    }

    // REMOVED: No side effects in GET requests - move to separate endpoint
    // if (quiz.total_questions !== questions.length) {
    //   await supabase.from('quizzes').update({ total_questions: questions.length }).eq('id', quizId)
    // }

    logger.info('Public quiz details fetch completed', { 
      quizId, 
      questionsCount: questions.length,
      isReadingQuiz: !!quiz.reading_passage
    })

    return NextResponse.json({
      success: true,
      quiz,
      questions
    })

  } catch (error: any) {
    logger.error('Public quiz details API error', { 
      error: error.message 
    })
    
    return NextResponse.json(
      { error: 'Failed to fetch quiz details' },
      { status: 500 }
    )
  }
}