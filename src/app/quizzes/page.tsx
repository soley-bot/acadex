'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { quizAPI } from '@/lib/database'

interface Quiz {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  duration_minutes: number
  is_published: boolean
  created_at: string
  question_count: number
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuizzes()
  }, [])

  const loadQuizzes = async () => {
    try {
      const { data, error } = await quizAPI.getQuizzes()
      if (error) {
        console.error('Error loading quizzes:', error)
      } else {
        setQuizzes(data || [])
      }
    } catch (error) {
      console.error('Error loading quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'intermediate':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'advanced':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-muted text-muted-foreground border'
    }
  }

  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      'Grammar': '📚',
      'Vocabulary': '📝',
      'Pronunciation': '🗣️',
      'Speaking': '💬',
      'Business English': '💼',
      'Writing': '✍️',
      'Literature': '📖',
      'Test Preparation': '🎯',
      'Science': '🔬',
      'Math': '🔢',
      'History': '📜',
      'Geography': '🌍',
    }
    return emojiMap[category] || '🧠'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
          
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium mb-6 border">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              Interactive Quizzes
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              Test Your
              <span className="block text-primary mt-2">Knowledge</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Challenge yourself with expertly crafted quizzes across multiple subjects. 
              Track your progress and master new concepts with instant feedback.
            </p>
          </div>
        </section>

        {/* Loading Content */}
        <section className="py-20 px-6 lg:px-8 border-t">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-48 bg-muted rounded-lg mb-4"></div>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-muted rounded-full"></div>
                      <div className="h-5 w-20 bg-muted rounded-full"></div>
                    </div>
                    <div className="h-6 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-5 w-24 bg-muted rounded"></div>
                      <div className="h-10 w-28 bg-muted rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium mb-6 border">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            Interactive Quizzes
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
            Test Your
            <span className="block text-primary mt-2">Knowledge</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Challenge yourself with expertly crafted quizzes across multiple subjects. 
            Track your progress and master new concepts with instant feedback.
          </p>
        </div>
      </section>

      {/* Quizzes Grid Section */}
      <section className="py-20 px-6 lg:px-8 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="group">
                <div className="card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  {/* Quiz Icon */}
                  <div className="h-48 bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center relative rounded-t-lg">
                    <span className="text-6xl">{getCategoryEmoji(quiz.category)}</span>
                    <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium border">
                      {quiz.question_count} questions
                    </div>
                  </div>

                  <div className="p-8">
                    {/* Category & Difficulty */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                        {quiz.category}
                      </span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getDifficultyColor(quiz.difficulty)}`}>
                        {quiz.difficulty}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold tracking-tight mb-3">
                      {quiz.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                      {quiz.description}
                    </p>

                    {/* Quiz Info */}
                    <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{quiz.duration_minutes} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>{quiz.question_count} questions</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link 
                      href={`/quizzes/${quiz.id}/take`}
                      className="btn-default w-full"
                    >
                      <span>Start Quiz</span>
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {quizzes.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-4">No Quizzes Available</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                We&apos;re working on adding more quizzes. Check back soon for new challenges!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
