import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/api-auth'
import { logger } from '@/lib/logger'

const supabase = createServiceClient()

// GET - Fetch quiz statistics (questions count, attempt stats) for public quizzes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const quizIds = searchParams.get('quizIds')?.split(',') || []
    
    if (quizIds.length === 0) {
      return NextResponse.json({ error: 'Quiz IDs are required' }, { status: 400 })
    }

    // Cap the number of quiz IDs to prevent abuse
    const limitedQuizIds = quizIds.slice(0, 50)

    logger.info('Public quiz statistics requested', { count: limitedQuizIds.length })

    // Efficient parallel queries for statistics
    const [questionCountsResult, attemptsStatsResult] = await Promise.all([
      // Get question counts efficiently
      supabase
        .from('quiz_questions')
        .select('quiz_id')
        .in('quiz_id', limitedQuizIds),
      
      // Get basic attempt statistics (without loading all attempt data)
      supabase
        .from('quiz_attempts')
        .select('quiz_id, score, total_questions')
        .in('quiz_id', limitedQuizIds)
    ])

    if (questionCountsResult.error) {
      throw new Error(`Question counts query failed: ${questionCountsResult.error.message}`)
    }

    if (attemptsStatsResult.error) {
      throw new Error(`Attempts stats query failed: ${attemptsStatsResult.error.message}`)
    }

    // Process question counts
    const questionCountMap = questionCountsResult.data.reduce((acc: any, q: any) => {
      acc[q.quiz_id] = (acc[q.quiz_id] || 0) + 1
      return acc
    }, {})

    // Process attempt statistics efficiently
    const attemptsStatsMap = attemptsStatsResult.data.reduce((acc: any, attempt: any) => {
      if (!acc[attempt.quiz_id]) {
        acc[attempt.quiz_id] = { totalAttempts: 0, totalScore: 0, totalPossible: 0 }
      }
      
      acc[attempt.quiz_id].totalAttempts++
      acc[attempt.quiz_id].totalScore += attempt.score || 0
      acc[attempt.quiz_id].totalPossible += attempt.total_questions || 0
      
      return acc
    }, {})

    // Format response efficiently
    const stats = limitedQuizIds.reduce((acc: any, quizId: string) => {
      const attemptStats = attemptsStatsMap[quizId] || { totalAttempts: 0, totalScore: 0, totalPossible: 0 }
      
      acc[quizId] = {
        question_count: questionCountMap[quizId] || 0,
        attempts_count: attemptStats.totalAttempts,
        average_score: attemptStats.totalAttempts > 0 
          ? Math.round((attemptStats.totalScore / attemptStats.totalPossible) * 100) 
          : 0
      }
      
      return acc
    }, {})

    logger.info('Public quiz statistics completed', { 
      requestedCount: limitedQuizIds.length,
      processedCount: Object.keys(stats).length
    })

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error: any) {
    logger.error('Public quiz statistics API error', { 
      error: error.message 
    })
    
    return NextResponse.json(
      { error: 'Failed to fetch quiz statistics' },
      { status: 500 }
    )
  }
}