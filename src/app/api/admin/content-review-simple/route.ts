import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface QuizForReview {
  id: string
  title: string
  description: string
  category: string
  is_published: boolean
  created_at: string
  total_questions: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get quizzes that might need review (recent AI-generated ones or drafts)
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select(`
        id,
        title,
        description,
        category,
        is_published,
        created_at,
        total_questions
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (quizzesError) {
      console.error('Error fetching quizzes for review:', quizzesError)
      return NextResponse.json({ error: 'Failed to fetch review data' }, { status: 500 })
    }

    // Transform quizzes into review items format
    const reviewItems = (quizzes as QuizForReview[])?.map((quiz: QuizForReview) => {
      // Simulate AI confidence score based on various factors
      let aiConfidenceScore = 0.85 // Default confidence
      
      // Lower confidence for very new quizzes (likely AI generated)
      const hoursOld = (new Date().getTime() - new Date(quiz.created_at).getTime()) / (1000 * 60 * 60)
      if (hoursOld < 2) {
        aiConfidenceScore = 0.75 + Math.random() * 0.15 // 0.75-0.90
      } else if (hoursOld < 24) {
        aiConfidenceScore = 0.80 + Math.random() * 0.15 // 0.80-0.95
      }

      // Lower confidence for unpublished content
      if (!quiz.is_published) {
        aiConfidenceScore -= 0.05
      }

      // Calculate priority based on confidence
      let priority: 'high' | 'medium' | 'low' = 'medium'
      if (aiConfidenceScore < 0.80) priority = 'high'
      else if (aiConfidenceScore < 0.90) priority = 'medium'
      else priority = 'low'

      // Estimate review time based on number of questions
      const estimatedReviewTime = Math.max(3, Math.ceil((quiz.total_questions || 5) * 0.8))

      return {
        id: quiz.id,
        content_type: 'quiz',
        title: `${quiz.title} (${quiz.total_questions || 0} questions)`,
        ai_confidence_score: aiConfidenceScore,
        priority,
        created_at: quiz.created_at,
        estimated_review_time: estimatedReviewTime
      }
    }) || []

    // Get some lesson content too (mock for now since we don't have lessons in content review)
    const mockLessons = [
      {
        id: 'lesson-1',
        content_type: 'lesson',
        title: 'AI Lesson: Present Perfect Tense Explanation',
        ai_confidence_score: 0.88,
        priority: 'medium' as const,
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        estimated_review_time: 5
      }
    ]

    // Combine and sort all review items
    const allItems = [...reviewItems, ...mockLessons]
    const sortedItems = allItems.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      // If same priority, newer items first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    // Calculate stats
    const stats = {
      needs_review: sortedItems.length,
      in_progress: Math.floor(sortedItems.length * 0.2), // 20% in progress
      approved_today: Math.floor(Math.random() * 15) + 5 // 5-20 approved today
    }

    return NextResponse.json({
      items: sortedItems,
      stats
    })

  } catch (error) {
    console.error('Error in content review API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
