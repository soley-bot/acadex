'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, AlertTriangle, CheckCircle, FileText, MessageSquare, Star, HelpCircle, BookOpen } from 'lucide-react'
import Link from 'next/link'

interface ReviewItem {
  id: string
  content_type: string
  title: string
  ai_confidence_score: number
  priority: 'high' | 'medium' | 'low'
  created_at: string
  estimated_review_time: number
}

interface ReviewStats {
  needs_review: number
  in_progress: number
  approved_today: number
  avg_review_time: number
  quality_score: number
}

export default function ContentReviewDashboard() {
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>([])
  const [stats, setStats] = useState<ReviewStats>({
    needs_review: 0,
    in_progress: 0,
    approved_today: 0,
    avg_review_time: 0,
    quality_score: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviewData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Helper function to calculate priority based on AI confidence
  const calculatePriority = (aiConfidence: number): 'high' | 'medium' | 'low' => {
    if (aiConfidence < 0.80) return 'high'      // Low confidence = needs careful review
    if (aiConfidence < 0.90) return 'medium'    // Medium confidence = standard review
    return 'low'                                // High confidence = quick check
  }

  const fetchReviewData = async () => {
    try {
      // TODO: Replace with actual API call to get real content
      // const response = await fetch('/api/admin/content-review')
      // const data = await response.json()
      
      // Mock data for now - but with AUTO-CALCULATED priorities
      const mockItems = [
        {
          id: '1',
          content_type: 'lesson',
          title: 'Grammar Lesson - Present Simple',
          ai_confidence_score: 0.85,
          created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          estimated_review_time: 5
        },
        {
          id: '2',
          content_type: 'quiz',
          title: 'Quiz: Present Simple Practice (8 questions)',
          ai_confidence_score: 0.92,
          created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          estimated_review_time: 8
        },
        {
          id: '3',
          content_type: 'quiz',
          title: 'Quiz: Verb Forms Assessment (12 questions)',
          ai_confidence_score: 0.78,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          estimated_review_time: 12
        },
        {
          id: '4',
          content_type: 'lesson',
          title: 'Conversation Practice - Ordering Food',
          ai_confidence_score: 0.88,
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          estimated_review_time: 6
        }
      ]

      // AUTO-CALCULATE priorities based on AI confidence
      const itemsWithPriority = mockItems.map(item => ({
        ...item,
        priority: calculatePriority(item.ai_confidence_score)
      }))

      // SORT by priority: high > medium > low, then by creation time
      const sortedQueue = itemsWithPriority.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        // If same priority, older items first
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      })

      setReviewQueue(sortedQueue)

      setStats({
        needs_review: 4,
        in_progress: 1,
        approved_today: 15,
        avg_review_time: 4.2,
        quality_score: 8.7
      })
    } catch (error) {
      console.error('Failed to fetch review data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive'
      case 'medium': return 'text-warning'
      case 'low': return 'text-muted-foreground'
      default: return 'text-foreground'
    }
  }

  const getPriorityIcon = (priority: string, contentType: string) => {
    const iconSize = 16
    
    if (contentType === 'quiz') {
      switch (priority) {
        case 'high': return <HelpCircle size={iconSize} className="text-destructive" />
        case 'medium': return <HelpCircle size={iconSize} className="text-warning" />
        case 'low': return <HelpCircle size={iconSize} className="text-muted-foreground" />
        default: return <HelpCircle size={iconSize} />
      }
    }
    
    // For lessons and other content
    switch (priority) {
      case 'high': return <AlertTriangle size={iconSize} className="text-destructive" />
      case 'medium': return <FileText size={iconSize} className="text-warning" />
      case 'low': return <MessageSquare size={iconSize} className="text-muted-foreground" />
      default: return <FileText size={iconSize} />
    }
  }

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'quiz': return <HelpCircle size={16} className="text-primary" />
      case 'lesson': return <BookOpen size={16} className="text-secondary" />
      default: return <FileText size={16} className="text-muted-foreground" />
    }
  }

  const getContentTypeBadge = (contentType: string) => {
    switch (contentType) {
      case 'quiz': return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
          <HelpCircle size={12} />
          Quiz
        </span>
      )
      case 'lesson': return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
          <BookOpen size={12} />
          Lesson
        </span>
      )
      default: return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted/30 text-muted-foreground rounded-full text-xs font-medium">
          <FileText size={12} />
          Content
        </span>
      )
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour(s) ago`
    return `${Math.floor(diffInMinutes / 1440)} day(s) ago`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Content Review Dashboard</h1>
        <p className="text-muted-foreground">Review AI-generated content before publication</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="base">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle size={20} className="text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Needs Review</p>
                <p className="text-2xl font-bold text-foreground">{stats.needs_review}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="base">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock size={20} className="text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-foreground">{stats.in_progress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="base">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle size={20} className="text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved Today</p>
                <p className="text-2xl font-bold text-foreground">{stats.approved_today}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Queue */}
      <Card variant="base">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle size={20} />
            Priority Review Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviewQueue.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="text-success mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">All caught up!</p>
              <p className="text-muted-foreground">No content waiting for review</p>
            </div>
          ) : (
            reviewQueue.map((item) => (
              <div
                key={item.id}
                className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getPriorityIcon(item.priority, item.content_type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getContentTypeBadge(item.content_type)}
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(item.priority) === 'text-destructive' ? 'bg-destructive/10 text-destructive' : 
                          getPriorityColor(item.priority) === 'text-warning' ? 'bg-warning/10 text-warning' :
                          'bg-muted/30 text-muted-foreground'}`}>
                          {item.priority.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-medium text-foreground">{item.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>AI Confidence: {Math.round(item.ai_confidence_score * 100)}%</span>
                        <span>Generated: {formatTimeAgo(item.created_at)}</span>
                        <span>~{item.estimated_review_time} min review</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/admin/content-review/${item.id}`}
                      className="bg-primary hover:bg-secondary text-white hover:text-black px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Review Now
                    </Link>
                    <button className="bg-muted hover:bg-muted/80 text-muted-foreground px-4 py-2 rounded-lg font-medium transition-colors">
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card variant="base">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star size={20} />
            Review Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{stats.approved_today}</p>
              <p className="text-sm text-muted-foreground">Reviewed Today</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{stats.avg_review_time}m</p>
              <p className="text-sm text-muted-foreground">Avg Review Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{stats.quality_score}/10</p>
              <p className="text-sm text-muted-foreground">Quality Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">23</p>
              <p className="text-sm text-muted-foreground">This Week</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
