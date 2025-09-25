'use client'

import { useState, useEffect, useCallback } from 'react'
import { BaseModal } from '@/components/ui/BaseModal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, Clock, Award, Target } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

interface QuizAnalyticsData {
  totalAttempts: number
  averageScore: number
  passRate: number
  averageCompletionTime: number
  popularCategories: { category: string; attempts: number }[]
  difficultyDistribution: { difficulty: string; count: number; avgScore: number }[]
  recentTrends: { date: string; attempts: number; avgScore: number }[]
  topPerformingQuizzes: { 
    title: string
    attempts: number
    avgScore: number
    passRate: number
  }[]
}

interface QuizAnalyticsProps {
  isOpen: boolean
  onClose: () => void
}

export function QuizAnalytics({ isOpen, onClose }: QuizAnalyticsProps) {
  const [analytics, setAnalytics] = useState<QuizAnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)

      // Calculate date filter based on time range
      let dateFilter = ''
      if (timeRange !== 'all') {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
        const date = new Date()
        date.setDate(date.getDate() - days)
        dateFilter = date.toISOString()
      }

      // Fetch quiz attempts with quiz details
      const attemptsQuery = supabase
        .from('quiz_attempts')
        .select(`
          *,
          quizzes (
            title,
            category,
            difficulty,
            duration_minutes
          )
        `)

      if (dateFilter) {
        attemptsQuery.gte('created_at', dateFilter)
      }

      const { data: attempts, error: attemptsError } = await attemptsQuery

      if (attemptsError) throw attemptsError

      if (!attempts || attempts.length === 0) {
        setAnalytics({
          totalAttempts: 0,
          averageScore: 0,
          passRate: 0,
          averageCompletionTime: 0,
          popularCategories: [],
          difficultyDistribution: [],
          recentTrends: [],
          topPerformingQuizzes: []
        })
        return
      }

      // Calculate basic metrics
      const totalAttempts = attempts.length
      const totalScore = attempts.reduce((sum: number, attempt: any) => {
        // Score is already stored as percentage
        return sum + attempt.score
      }, 0)
      const averageScore = totalScore / totalAttempts

      const passedAttempts = attempts.filter((attempt: any) => {
        // Score is already stored as percentage
        return attempt.score >= (attempt.quizzes?.passing_score || 70)
      }).length
      const passRate = (passedAttempts / totalAttempts) * 100

      // Calculate average completion time (mock data for now)
      const averageCompletionTime = attempts.reduce((sum: number, attempt: any) => {
        return sum + (attempt.quizzes?.duration_minutes || 20)
      }, 0) / totalAttempts

      // Popular categories
      const categoryMap = new Map<string, number>()
      attempts.forEach((attempt: any) => {
        const category = attempt.quizzes?.category || 'Unknown'
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
      })
      const popularCategories = Array.from(categoryMap.entries())
        .map(([category, attempts]) => ({ category, attempts }))
        .sort((a, b) => b.attempts - a.attempts)
        .slice(0, 5)

      // Difficulty distribution
      const difficultyMap = new Map<string, { count: number; totalScore: number }>()
      attempts.forEach((attempt: any) => {
        const difficulty = attempt.quizzes?.difficulty || 'unknown'
        // Score is already stored as percentage
        const current = difficultyMap.get(difficulty) || { count: 0, totalScore: 0 }
        difficultyMap.set(difficulty, {
          count: current.count + 1,
          totalScore: current.totalScore + attempt.score
        })
      })
      const difficultyDistribution = Array.from(difficultyMap.entries())
        .map(([difficulty, data]) => ({
          difficulty,
          count: data.count,
          avgScore: data.totalScore / data.count
        }))

      // Recent trends (last 7 days)
      const recentTrends: { date: string; attempts: number; avgScore: number }[] = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayAttempts = attempts.filter((attempt: any) => 
          attempt.created_at.startsWith(dateStr)
        )
        
        const dayAvgScore = dayAttempts.length > 0 
          ? dayAttempts.reduce((sum: number, attempt: any) => {
              // Score is already stored as percentage
              return sum + attempt.score
            }, 0) / dayAttempts.length
          : 0
        
        recentTrends.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          attempts: dayAttempts.length,
          avgScore: dayAvgScore
        })
      }

      // Top performing quizzes
      const quizMap = new Map<string, { 
        attempts: number
        totalScore: number
        passed: number
        title: string
      }>()
      
      attempts.forEach((attempt: any) => {
        const quizTitle = attempt.quizzes?.title || 'Unknown Quiz'
        // Score is already stored as percentage
        const isPassed = attempt.score >= (attempt.quizzes?.passing_score || 70)
        
        const current = quizMap.get(quizTitle) || { 
          attempts: 0, 
          totalScore: 0, 
          passed: 0, 
          title: quizTitle 
        }
        
        quizMap.set(quizTitle, {
          attempts: current.attempts + 1,
          totalScore: current.totalScore + attempt.score,
          passed: current.passed + (isPassed ? 1 : 0),
          title: quizTitle
        })
      })

      const topPerformingQuizzes = Array.from(quizMap.values())
        .filter(quiz => quiz.attempts >= 3) // Only include quizzes with meaningful data
        .map(quiz => ({
          title: quiz.title,
          attempts: quiz.attempts,
          avgScore: quiz.totalScore / quiz.attempts,
          passRate: (quiz.passed / quiz.attempts) * 100
        }))
        .sort((a, b) => b.avgScore - a.avgScore)
        .slice(0, 5)

      setAnalytics({
        totalAttempts,
        averageScore,
        passRate,
        averageCompletionTime,
        popularCategories,
        difficultyDistribution,
        recentTrends,
        topPerformingQuizzes
      })

    } catch (err: any) {
      logger.error('Error fetching quiz analytics:', err)
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics()
    }
  }, [isOpen, fetchAnalytics])

  if (!isOpen) return null

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Quiz Analytics"
    >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading analytics...</p>
              </div>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.totalAttempts.toLocaleString()}</p>
                      </div>
                      <Users className="h-8 w-8 text-secondary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Average Score</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.averageScore.toFixed(1)}%</p>
                      </div>
                      <Award className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.passRate.toFixed(1)}%</p>
                      </div>
                      <Target className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.averageCompletionTime.toFixed(0)}min</p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts and detailed analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Popular Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Categories</CardTitle>
                    <CardDescription>Most attempted quiz categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.popularCategories.map((category, index) => (
                        <div key={category.category} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-blue-500' :
                              index === 1 ? 'bg-green-500' :
                              index === 2 ? 'bg-purple-500' :
                              index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                            }`} />
                            <span className="font-medium">{category.category}</span>
                          </div>
                          <span className="text-gray-600">{category.attempts} attempts</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Difficulty Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Difficulty Analysis</CardTitle>
                    <CardDescription>Performance by difficulty level</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.difficultyDistribution.map((diff) => (
                        <div key={diff.difficulty} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium capitalize">{diff.difficulty}</span>
                            <span className="text-sm text-gray-600">{diff.count} attempts</span>
                          </div>
                          <div className="w-full bg-muted/60 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                diff.difficulty === 'beginner' ? 'bg-green-500' :
                                diff.difficulty === 'intermediate' ? 'bg-yellow-500' :
                                'bg-primary/50'
                              }`}
                              style={{ width: `${diff.avgScore}%` }}
                            />
                          </div>
                          <div className="text-sm text-gray-600">
                            Average: {diff.avgScore.toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Quiz attempts over the last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.recentTrends.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <span className="text-sm font-medium">{trend.date}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">{trend.attempts} attempts</span>
                            <span className={`text-sm font-medium ${
                              trend.avgScore >= 80 ? 'text-green-600' :
                              trend.avgScore >= 60 ? 'text-yellow-600' : 'text-primary'
                            }`}>
                              {trend.avgScore.toFixed(1)}% avg
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Performing Quizzes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Quizzes</CardTitle>
                    <CardDescription>Highest scoring quizzes with multiple attempts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.topPerformingQuizzes.length > 0 ? (
                        analytics.topPerformingQuizzes.map((quiz, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium text-sm truncate mb-1">{quiz.title}</div>
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>{quiz.attempts} attempts</span>
                              <span>{quiz.avgScore.toFixed(1)}% avg • {quiz.passRate.toFixed(1)}% pass</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No quizzes with sufficient data yet
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-20">
              <p className="text-gray-500">No analytics data available</p>
            </div>
          )}
    </BaseModal>
  )
}

