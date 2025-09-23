/**
 * Dashboard API Endpoint
 * Week 2 Day 2: Progressive dashboard data loading
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/api-auth'
import { logger } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    const supabase = createServiceClient()
    
    // Get user's quiz attempts and stats
    const { data: attempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quizzes:quiz_id (
          title,
          category
        )
      `)
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
    
    if (attemptsError) {
      logger.error('Failed to fetch quiz attempts', { error: attemptsError, userId })
      throw attemptsError
    }
    
    // Get total quizzes available
    const { count: totalQuizzes, error: quizCountError } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)
    
    if (quizCountError) {
      logger.error('Failed to count quizzes', { error: quizCountError })
      throw quizCountError
    }
    
    // Calculate stats
    const completedQuizzes = attempts?.length || 0
    const totalScore = attempts?.reduce((sum: number, attempt: any) => sum + (attempt.score || 0), 0) || 0
    const averageScore = completedQuizzes > 0 ? Math.round(totalScore / completedQuizzes) : 0
    
    // Calculate total time spent (in minutes)
    const totalTimeSpent = attempts?.reduce((sum: number, attempt: any) => {
      const timeSpent = attempt.time_spent || 0
      return sum + Math.round(timeSpent / 60000) // Convert ms to minutes
    }, 0) || 0
    
    // Calculate current streak (simplified - consecutive days with activity)
    let currentStreak = 0
    if (attempts && attempts.length > 0) {
      const today = new Date()
      const sortedAttempts = attempts.sort((a: any, b: any) => 
        new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
      )
      
      let checkDate = new Date(today)
      for (const attempt of sortedAttempts) {
        const attemptDate = new Date(attempt.submitted_at)
        const daysDiff = Math.floor((checkDate.getTime() - attemptDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff <= 1) {
          currentStreak++
          checkDate = attemptDate
        } else {
          break
        }
      }
    }
    
    // Find best category (most completed quizzes)
    const categoryStats: Record<string, number> = {}
    attempts?.forEach((attempt: any) => {
      const category = attempt.quizzes?.category || 'Unknown'
      categoryStats[category] = (categoryStats[category] || 0) + 1
    })
    
    const bestCategory = Object.keys(categoryStats).reduce((best, category) => 
      categoryStats[category] > (categoryStats[best] || 0) ? category : best
    , 'None')
    
    // Recent activity (last 10 attempts)
    const recentActivity = attempts?.slice(0, 10).map((attempt: any) => ({
      id: attempt.id,
      type: 'quiz_completed' as const,
      title: attempt.quizzes?.title || 'Unknown Quiz',
      timestamp: attempt.submitted_at,
      score: attempt.score
    })) || []
    
    const dashboardStats = {
      totalQuizzes: totalQuizzes || 0,
      completedQuizzes,
      averageScore,
      totalTimeSpent,
      currentStreak,
      bestCategory,
      recentActivity
    }
    
    logger.info('Dashboard stats generated', { 
      userId, 
      stats: {
        completedQuizzes,
        averageScore,
        totalTimeSpent,
        currentStreak
      }
    })
    
    return NextResponse.json(dashboardStats)
    
  } catch (error) {
    logger.error('Dashboard API error', { error })
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    )
  }
}