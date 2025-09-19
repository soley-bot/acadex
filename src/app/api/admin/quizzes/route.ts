import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, withServiceRole } from '@/lib/api-auth'
import { logger } from '@/lib/logger'

// GET - Fetch all quizzes for admin (SECURE)
export const GET = withAdminAuth(async (request: NextRequest, user) => {
  try {
    logger.info('Admin quizzes fetch requested', { adminUserId: user.id })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const difficulty = searchParams.get('difficulty') || ''
    
    // API Optimization: Support different response modes
    const mode = searchParams.get('mode') || 'full' // 'slim', 'full', 'stats'
    const fields = searchParams.get('fields')?.split(',') || []

    const { quizzes, pagination } = await withServiceRole(user, async (serviceClient) => {
      const from = (page - 1) * limit
      const to = from + limit - 1

      // Define field sets for different modes
      const fieldSets = {
        slim: `id, title, category, difficulty, is_published, created_at, image_url`,
        full: `
          id, title, description, category, difficulty, duration_minutes,
          total_questions, passing_score, max_attempts, time_limit_minutes,
          is_published, created_at, updated_at, image_url, course_id, lesson_id,
          shuffle_questions, shuffle_options, show_results_immediately,
          allow_review, allow_backtrack, randomize_questions,
          questions_per_page, show_progress, auto_submit, instructions,
          tags, estimated_time_minutes
        `,
        reading: `
          id, title, description, category, difficulty, duration_minutes,
          is_published, created_at, updated_at, image_url,
          reading_passage, passage_title, passage_source, passage_audio_url,
          word_count, estimated_read_time
        `
      }

      // Use custom fields if provided, otherwise use mode-based field set
      const selectFields = fields.length > 0 
        ? fields.join(', ')
        : fieldSets[mode as keyof typeof fieldSets] || fieldSets.slim

      // Build the optimized query
      let query = serviceClient
        .from('quizzes')
        .select(selectFields, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      // Apply filters
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      }
      
      if (category) {
        query = query.eq('category', category)
      }
      
      if (difficulty) {
        query = query.eq('difficulty', difficulty)
      }

      const { data: quizzes, error: quizzesError, count } = await query

      if (quizzesError) {
        throw new Error(`Database error: ${quizzesError.message}`)
      }

      // Only load statistics for full mode or when explicitly requested
      if (mode === 'full' || mode === 'stats' || fields.some(f => ['total_questions', 'attempts_count', 'average_score'].includes(f))) {
        const quizIds = quizzes?.map((q: any) => q.id) || []
        
        // Get question counts for each quiz
        const { data: questionCounts, error: questionCountsError } = await serviceClient
          .from('quiz_questions')
          .select('quiz_id')
          .in('quiz_id', quizIds)

        // Count questions per quiz
        const questionCountMap = questionCounts?.reduce((acc: any, q: any) => {
          acc[q.quiz_id] = (acc[q.quiz_id] || 0) + 1
          return acc
        }, {}) || {}

        // Get attempt counts and scores for each quiz
        const { data: attempts } = await serviceClient
          .from('quiz_attempts')
          .select('quiz_id, score')
          .in('quiz_id', quizIds)

        // Count attempts and calculate average scores per quiz
        const quizStats = attempts?.reduce((acc: any, attempt: any) => {
          if (!acc[attempt.quiz_id]) {
            acc[attempt.quiz_id] = { count: 0, totalScore: 0 }
          }
          acc[attempt.quiz_id].count++
          acc[attempt.quiz_id].totalScore += attempt.score || 0
          return acc
        }, {}) || {}

        // Combine data with frontend-expected field names
        const enrichedQuizzes = quizzes?.map((quiz: any) => {
          const stats = quizStats[quiz.id] || { count: 0, totalScore: 0 }
          const averageScore = stats.count > 0 ? Math.round(stats.totalScore / stats.count) : 0
          
          return {
            ...quiz,
            total_questions: questionCountMap[quiz.id] || 0,
            attempts_count: stats.count,
            average_score: averageScore
          }
        })

        return {
          quizzes: enrichedQuizzes,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
          }
        }
      } else {
        // Slim mode - return quizzes without expensive statistics
        return {
          quizzes: quizzes || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
          }
        }
      }
    })

    logger.info('Admin quizzes fetch completed', { 
      adminUserId: user.id, 
      count: quizzes?.length || 0 
    })

    return NextResponse.json({
      quizzes,
      pagination
    })

  } catch (error: any) {
    logger.error('Quizzes fetch failed', { 
      adminUserId: user.id, 
      error: error.message 
    })
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
})

// POST - Create new quiz (SECURE)
export const POST = withAdminAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    
    logger.info('Admin quiz creation requested', { 
      adminUserId: user.id, 
      quizTitle: body.title 
    })

    const quiz = await withServiceRole(user, async (serviceClient) => {
      const { data, error } = await serviceClient
        .from('quizzes')
        .insert([{
          title: body.title,
          description: body.description,
          category: body.category,
          difficulty: body.difficulty,
          duration_minutes: body.duration_minutes || 30,
          total_questions: body.total_questions || 0,
          passing_score: body.passing_score || 70,
          max_attempts: body.max_attempts || 3,
          time_limit_minutes: body.time_limit_minutes,
          is_published: body.is_published || false,
          image_url: body.image_url,
          course_id: body.course_id,
          lesson_id: body.lesson_id,
          shuffle_questions: body.shuffle_questions || false,
          shuffle_options: body.shuffle_options || false,
          show_results_immediately: body.show_results_immediately !== false,
          allow_review: body.allow_review !== false,
          allow_backtrack: body.allow_backtrack !== false,
          randomize_questions: body.randomize_questions || false,
          questions_per_page: body.questions_per_page || 1,
          show_progress: body.show_progress !== false,
          auto_submit: body.auto_submit || false,
          instructions: body.instructions || '',
          tags: body.tags || [],
          estimated_time_minutes: body.estimated_time_minutes,
          
          // Reading quiz fields
          reading_passage: body.reading_passage,
          passage_title: body.passage_title,
          passage_source: body.passage_source,
          passage_audio_url: body.passage_audio_url,
          word_count: body.word_count,
          estimated_read_time: body.estimated_read_time
        }])
        .select()
        .single()

      if (error) {
        throw new Error(`Quiz creation failed: ${error.message}`)
      }

      return data
    })

    logger.info('Admin quiz creation completed', { 
      adminUserId: user.id, 
      quizId: quiz.id 
    })

    return NextResponse.json({ quiz })

  } catch (error: any) {
    logger.error('Quiz creation failed', { 
      adminUserId: user.id, 
      error: error.message 
    })
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
})

// PUT - Update existing quiz (SECURE)
export const PUT = withAdminAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    const quizId = body.id

    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 })
    }

    logger.info('Admin quiz update requested', { 
      adminUserId: user.id, 
      quizId 
    })

    const quiz = await withServiceRole(user, async (serviceClient) => {
      const { data, error } = await serviceClient
        .from('quizzes')
        .update({
          title: body.title,
          description: body.description,
          category: body.category,
          difficulty: body.difficulty,
          duration_minutes: body.duration_minutes,
          total_questions: body.total_questions,
          passing_score: body.passing_score,
          max_attempts: body.max_attempts,
          time_limit_minutes: body.time_limit_minutes,
          is_published: body.is_published,
          image_url: body.image_url,
          course_id: body.course_id,
          lesson_id: body.lesson_id,
          shuffle_questions: body.shuffle_questions,
          shuffle_options: body.shuffle_options,
          show_results_immediately: body.show_results_immediately,
          allow_review: body.allow_review,
          allow_backtrack: body.allow_backtrack,
          randomize_questions: body.randomize_questions,
          questions_per_page: body.questions_per_page,
          show_progress: body.show_progress,
          auto_submit: body.auto_submit,
          instructions: body.instructions,
          tags: body.tags,
          estimated_time_minutes: body.estimated_time_minutes,
          updated_at: new Date().toISOString()
        })
        .eq('id', quizId)
        .select()
        .single()

      if (error) {
        throw new Error(`Quiz update failed: ${error.message}`)
      }

      return data
    })

    logger.info('Admin quiz update completed', { 
      adminUserId: user.id, 
      quizId: quiz.id 
    })

    return NextResponse.json({ quiz })

  } catch (error: any) {
    logger.error('Quiz update failed', { 
      adminUserId: user.id, 
      error: error.message 
    })
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
})

// DELETE - Remove quiz (SECURE)
export const DELETE = withAdminAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const quizId = searchParams.get('id')

    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 })
    }

    logger.info('Admin quiz deletion requested', { 
      adminUserId: user.id, 
      quizId 
    })

    await withServiceRole(user, async (serviceClient) => {
      const { error } = await serviceClient
        .from('quizzes')
        .delete()
        .eq('id', quizId)

      if (error) {
        throw new Error(`Quiz deletion failed: ${error.message}`)
      }
    })

    logger.info('Admin quiz deletion completed', { 
      adminUserId: user.id, 
      quizId 
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    logger.error('Quiz deletion failed', { 
      adminUserId: user.id, 
      error: error.message 
    })
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
})
