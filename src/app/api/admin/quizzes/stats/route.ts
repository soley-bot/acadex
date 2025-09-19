import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, withServiceRole } from '@/lib/api-auth'
import { logger } from '@/lib/logger'

// GET - Fetch quiz statistics only (for lazy loading)
export const GET = withAdminAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const quizIds = searchParams.get('quizIds')?.split(',') || []
    
    if (quizIds.length === 0) {
      return NextResponse.json({ error: 'Quiz IDs are required' }, { status: 400 })
    }

    logger.info('Quiz statistics fetch requested', { 
      adminUserId: user.id, 
      quizCount: quizIds.length 
    })

    const stats = await withServiceRole(user, async (serviceClient) => {
      // Get question counts in parallel
      const [questionCountsResult, attemptsResult] = await Promise.all([
        serviceClient
          .from('quiz_questions')
          .select('quiz_id')
          .in('quiz_id', quizIds),
        serviceClient
          .from('quiz_attempts')
          .select('quiz_id, score')
          .in('quiz_id', quizIds)
      ])

      const { data: questionCounts } = questionCountsResult
      const { data: attempts } = attemptsResult

      // Count questions per quiz
      const questionCountMap = questionCounts?.reduce((acc: any, q: any) => {
        acc[q.quiz_id] = (acc[q.quiz_id] || 0) + 1
        return acc
      }, {}) || {}

      // Count attempts and calculate average scores per quiz
      const quizStats = attempts?.reduce((acc: any, attempt: any) => {
        if (!acc[attempt.quiz_id]) {
          acc[attempt.quiz_id] = { count: 0, totalScore: 0 }
        }
        acc[attempt.quiz_id].count++
        acc[attempt.quiz_id].totalScore += attempt.score || 0
        return acc
      }, {}) || {}

      // Format response
      const formattedStats = quizIds.reduce((acc: any, quizId: string) => {
        const stats = quizStats[quizId] || { count: 0, totalScore: 0 }
        const averageScore = stats.count > 0 ? Math.round(stats.totalScore / stats.count) : 0
        
        acc[quizId] = {
          total_questions: questionCountMap[quizId] || 0,
          attempts_count: stats.count,
          average_score: averageScore
        }
        return acc
      }, {})

      return formattedStats
    })

    return NextResponse.json({ stats })

  } catch (error: any) {
    logger.error('Quiz statistics fetch failed', { 
      adminUserId: user.id, 
      error: error.message 
    })
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
})