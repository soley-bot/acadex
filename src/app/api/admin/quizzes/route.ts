import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Create authenticated Supabase client from Authorization header or cookies
function createAuthenticatedClient(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    logger.info('Using Bearer token authentication for quiz API')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })
    
    return supabase
  }
  
  // Fallback to cookie-based auth (for server-side rendering)
  const { createServerClient } = require('@supabase/ssr')
  const { cookies } = require('next/headers')
  
  logger.info('Using cookie authentication for quiz API')
  return createServerClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      cookies: {
        get: (name: string) => cookies().get(name)?.value,
        set: () => {},
        remove: () => {}
      }
    }
  )
}

// Verify admin authentication
async function verifyAdminAuth(supabase: any) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      logger.warn('Quiz API: No authenticated user found')
      return { error: 'Unauthorized', user: null }
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      logger.warn(`Quiz API: User profile not found: ${user.id}`)
      return { error: 'User profile not found', user: null }
    }

    if (!['admin', 'instructor'].includes(profile.role)) {
      logger.warn(`Quiz API: Access denied for user role: ${profile.role}`)
      return { error: 'Access denied', user: null }
    }

    logger.info(`Quiz API: Admin access verified for user: ${user.id}, role: ${profile.role}`)
    return { user, role: profile.role }
  } catch (error) {
    logger.error('Quiz API: Auth verification error:', error)
    return { error: 'Authentication failed', user: null }
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAuthenticatedClient(request)
    const authResult = await verifyAdminAuth(supabase)
    
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const difficulty = searchParams.get('difficulty') || ''

    const from = (page - 1) * limit
    const to = from + limit - 1

    // Build the query
    let query = supabase
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
        time_limit_minutes,
        is_published,
        created_at,
        updated_at,
        image_url,
        course_id,
        lesson_id,
        shuffle_questions,
        shuffle_options,
        show_results_immediately,
        allow_review,
        allow_backtrack,
        randomize_questions,
        questions_per_page,
        show_progress,
        auto_submit,
        instructions,
        tags,
        estimated_time_minutes
      `)
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
      logger.error('Quiz API: Error fetching quizzes:', quizzesError)
      return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 })
    }

    // Get question counts for each quiz
    const quizIds = quizzes?.map((q: any) => q.id) || []
    const { data: questionCounts, error: questionCountError } = await supabase
      .from('quiz_questions')
      .select('quiz_id')
      .in('quiz_id', quizIds)

    if (questionCountError) {
      logger.warn('Quiz API: Error fetching question counts:', questionCountError)
    }

    // Count questions per quiz
    const questionCountMap = questionCounts?.reduce((acc: any, q: any) => {
      acc[q.quiz_id] = (acc[q.quiz_id] || 0) + 1
      return acc
    }, {}) || {}

    // Get attempt counts for each quiz
    const { data: attempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select('quiz_id')
      .in('quiz_id', quizIds)

    if (attemptsError) {
      logger.warn('Quiz API: Error fetching attempt counts:', attemptsError)
    }

    // Count attempts per quiz
    const attemptCountMap = attempts?.reduce((acc: any, a: any) => {
      acc[a.quiz_id] = (acc[a.quiz_id] || 0) + 1
      return acc
    }, {}) || {}

    // Combine data
    const enrichedQuizzes = quizzes?.map((quiz: any) => ({
      ...quiz,
      question_count: questionCountMap[quiz.id] || 0,
      attempt_count: attemptCountMap[quiz.id] || 0
    }))

    logger.info(`Quiz API: Successfully fetched ${enrichedQuizzes?.length || 0} quizzes`)

    return NextResponse.json({
      quizzes: enrichedQuizzes,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    logger.error('Quiz API: Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAuthenticatedClient(request)
    const authResult = await verifyAdminAuth(supabase)
    
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const body = await request.json()
    
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert([{
        title: body.title,
        description: body.description,
        category: body.category,
        difficulty: body.difficulty,
        duration_minutes: body.duration_minutes || 30,
        total_questions: body.total_questions || 10,
        passing_score: body.passing_score || 70,
        max_attempts: body.max_attempts || 3,
        time_limit_minutes: body.time_limit_minutes,
        is_published: body.is_published || false,
        image_url: body.image_url
      }])
      .select()
      .single()

    if (quizError) {
      logger.error('Quiz API: Error creating quiz:', quizError)
      return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 })
    }

    logger.info(`Quiz API: Successfully created quiz: ${quiz.id}`)
    return NextResponse.json({ quiz })

  } catch (error) {
    logger.error('Quiz API: Unexpected error in POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createAuthenticatedClient(request)
    const authResult = await verifyAdminAuth(supabase)
    
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const body = await request.json()
    const quizId = body.id

    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 })
    }

    const { data: quiz, error: quizError } = await supabase
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
        updated_at: new Date().toISOString()
      })
      .eq('id', quizId)
      .select()
      .single()

    if (quizError) {
      logger.error('Quiz API: Error updating quiz:', quizError)
      return NextResponse.json({ error: 'Failed to update quiz' }, { status: 500 })
    }

    logger.info(`Quiz API: Successfully updated quiz: ${quiz.id}`)
    return NextResponse.json({ quiz })

  } catch (error) {
    logger.error('Quiz API: Unexpected error in PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createAuthenticatedClient(request)
    const authResult = await verifyAdminAuth(supabase)
    
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const quizId = searchParams.get('id')

    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 })
    }

    const { error: quizError } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId)

    if (quizError) {
      logger.error('Quiz API: Error deleting quiz:', quizError)
      return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 })
    }

    logger.info(`Quiz API: Successfully deleted quiz: ${quizId}`)
    return NextResponse.json({ success: true })

  } catch (error) {
    logger.error('Quiz API: Unexpected error in DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
