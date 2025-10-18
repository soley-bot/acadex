import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/api-auth'
import { logger } from '@/lib/logger'

// GET - Fetch public quizzes (OPTIMIZED FOR PERFORMANCE)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50) // Cap at 50
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const difficulty = searchParams.get('difficulty') || ''
    
    // Performance optimization: Support different response modes
    const mode = searchParams.get('mode') || 'list' // 'list', 'detailed'
    
    logger.info('Public quizzes fetch requested', { 
      page, 
      limit, 
      search: !!search, 
      category: !!category,
      difficulty: !!difficulty,
      mode 
    })

    const from = (page - 1) * limit
    const to = from + limit - 1

    // OPTIMIZED: Different query strategies based on mode
    let selectFields: string
    
    if (mode === 'list') {
      // Minimal fields for list view - FAST (includes reading quiz indicators)
      selectFields = `
        id,
        title,
        description,
        category,
        difficulty,
        duration_minutes,
        total_questions,
        image_url,
        is_published,
        created_at,
        passing_score,
        reading_passage,
        passage_title,
        word_count,
        estimated_read_time
      `
    } else {
      // More fields for detailed view (includes all reading quiz fields)
      selectFields = `
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
        created_at,
        instructions,
        tags,
        reading_passage,
        passage_title,
        passage_source,
        passage_audio_url,
        word_count,
        estimated_read_time
      `
    }

    // Build optimized query - NO EXPENSIVE JOINS for list mode
    let query = supabase
      .from('quizzes')
      .select(selectFields, { count: 'exact' })
      .eq('is_published', true) // Only published quizzes for public
      .order('created_at', { ascending: false })
      .range(from, to)

    // Apply filters efficiently
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    
    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty)
    }

    const { data: quizzes, error, count } = await query

    if (error) {
      logger.error('Public quizzes fetch failed', { error: error.message })
      return NextResponse.json(
        { error: 'Failed to fetch quizzes' },
        { status: 500 }
      )
    }

    // For list mode, return minimal data quickly with question counts
    if (mode === 'list') {
      // Add question count for quizzes where total_questions is null or 0
      const quizzesWithCounts = await Promise.all(
        (quizzes || []).map(async (quiz: any) => {
          if (!quiz.total_questions || quiz.total_questions === 0) {
            // Fallback: count questions from quiz_questions table
            const { count: questionCount } = await supabase
              .from('quiz_questions')
              .select('*', { count: 'exact', head: true })
              .eq('quiz_id', quiz.id)
            
            return {
              ...quiz,
              total_questions: questionCount || 0,
              question_count: questionCount || 0 // Backup field
            }
          }
          return {
            ...quiz,
            question_count: quiz.total_questions // Backup field
          }
        })
      )

      return NextResponse.json({
        success: true,
        quizzes: quizzesWithCounts,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasMore: count ? count > from + limit : false
        }
      })
    }

    // For detailed mode, optionally add minimal stats (cached or pre-computed)
    // Future: Add cached statistics lookup when performance optimization needed
    
    logger.info('Public quizzes fetch completed', { 
      count: quizzes?.length || 0,
      total: count || 0,
      mode
    })

    return NextResponse.json({
      success: true,
      quizzes: quizzes || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: count ? count > from + limit : false
      }
    })

  } catch (error: any) {
    logger.error('Public quizzes API error', { 
      error: error.message,
      stack: error.stack 
    })
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}