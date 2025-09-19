import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// GET - Fetch single public quiz with questions for taking
export async function GET(request: NextRequest) {
  // Extract quiz ID from URL pathname
  const url = new URL(request.url)
  const quizId = url.pathname.split('/').pop()
  
  try {
    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 })
    }

    logger.info('Public quiz details fetch requested', { quizId })

    // Fetch quiz and questions in parallel - optimized for quiz taking
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
          estimated_read_time
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
          correct_answer,
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

    // Update total_questions if it's incorrect
    if (quiz.total_questions !== questions.length) {
      await supabase
        .from('quizzes')
        .update({ total_questions: questions.length })
        .eq('id', quizId)
      
      quiz.total_questions = questions.length
    }

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
      quizId,
      error: error.message 
    })
    
    return NextResponse.json(
      { error: 'Failed to fetch quiz details' },
      { status: 500 }
    )
  }
}