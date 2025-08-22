'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, AlertTriangle, CheckCircle, FileText, MessageSquare, Star, HelpCircle, BookOpen, Eye } from 'lucide-react'
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
}

interface ContentReviewPanelProps {
  compact?: boolean
  maxItems?: number
  className?: string
  refreshTrigger?: number // Add this to trigger refreshes
}

export function ContentReviewPanel({ compact = false, maxItems = 5, className = '', refreshTrigger }: ContentReviewPanelProps) {
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>([])
  const [stats, setStats] = useState<ReviewStats>({
    needs_review: 0,
    in_progress: 0,
    approved_today: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to calculate priority based on AI confidence
  const calculatePriority = (aiConfidence: number): 'high' | 'medium' | 'low' => {
    if (aiConfidence < 0.80) return 'high'      // Low confidence = needs careful review
    if (aiConfidence < 0.90) return 'medium'    // Medium confidence = standard review
    return 'low'                                // High confidence = quick check
  }

  const fetchReviewData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use real API endpoint to get content from database
      const response = await fetch(`/api/admin/content-review-simple?limit=${maxItems || 10}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format')
      }
      
      if (!Array.isArray(data.items)) {
        throw new Error('Response items is not an array')
      }
      
      // Validate each item has required fields
      const validatedItems = data.items.filter((item: any) => {
        const isValid = item && 
          typeof item.id === 'string' &&
          typeof item.title === 'string' &&
          typeof item.content_type === 'string' &&
          typeof item.ai_confidence_score === 'number' &&
          typeof item.priority === 'string' &&
          typeof item.created_at === 'string' &&
          typeof item.estimated_review_time === 'number'
        
        if (!isValid) {
          console.warn('ContentReviewPanel - Invalid item structure:', {
            item,
            expectedFields: ['id', 'title', 'content_type', 'ai_confidence_score', 'priority', 'created_at', 'estimated_review_time']
          })
        }
        return isValid
      })
      
      console.log('ContentReviewPanel - Data loaded successfully:', {
        totalItems: validatedItems.length,
        props: { compact, maxItems, refreshTrigger },
        sampleItem: validatedItems[0] || null
      })
      
      setReviewQueue(validatedItems)
      setStats(data.stats || {
        needs_review: 0,
        in_progress: 0,
        approved_today: 0
      })
    } catch (error) {
      console.error('Failed to fetch review data:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      
      // Fallback to mock data if API fails
      const mockItems = [
        {
          id: '1',
          content_type: 'quiz',
          title: 'AI Quiz: English Grammar Fundamentals (10 questions)',
          ai_confidence_score: 0.87,
          created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
          estimated_review_time: 8
        },
        {
          id: '2',
          content_type: 'quiz',
          title: 'AI Quiz: Business English Communication (15 questions)',
          ai_confidence_score: 0.92,
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
          estimated_review_time: 12
        }
      ]

      // AUTO-CALCULATE priorities based on AI confidence
      const itemsWithPriority = mockItems.map(item => ({
        ...item,
        priority: calculatePriority(item.ai_confidence_score)
      }))

      const limitedQueue = maxItems ? itemsWithPriority.slice(0, maxItems) : itemsWithPriority
      setReviewQueue(limitedQueue)

      setStats({
        needs_review: limitedQueue.length,
        in_progress: 1,
        approved_today: 12
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviewData()
  }, [refreshTrigger]) // eslint-disable-line react-hooks/exhaustive-deps

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
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
    const iconSize = compact ? 14 : 16
    
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

  const getContentTypeBadge = (contentType: string) => {
    const badgeSize = compact ? 12 : 14
    switch (contentType) {
      case 'quiz':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary`}>
            <HelpCircle size={badgeSize} />
            Quiz
          </span>
        )
      case 'lesson':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary`}>
            <BookOpen size={badgeSize} />
            Lesson
          </span>
        )
      default:
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted/10 text-muted-foreground`}>
            <FileText size={badgeSize} />
            Content
          </span>
        )
    }
  }

  if (loading) {
    return (
      <Card variant="base" className={className}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${compact ? 'text-lg' : 'text-xl'}`}>
            <AlertTriangle size={compact ? 18 : 20} />
            Content Review Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-${compact ? '16' : '20'} bg-muted rounded animate-pulse`}></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card variant="base" className={className}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${compact ? 'text-lg' : 'text-xl'} text-destructive`}>
            <AlertTriangle size={compact ? 18 : 20} />
            Content Review Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertTriangle size={compact ? 32 : 48} className="text-destructive mx-auto mb-3" />
            <p className={`${compact ? 'text-sm' : 'text-base'} font-medium text-destructive mb-2`}>Failed to load content review data</p>
            <p className="text-muted-foreground text-xs">{error}</p>
            <button 
              onClick={() => fetchReviewData()} 
              className="mt-3 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-secondary hover:text-black transition-colors"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="base" className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center gap-2 ${compact ? 'text-lg' : 'text-xl'}`}>
            <AlertTriangle size={compact ? 18 : 20} />
            Content Review Queue
          </CardTitle>
          {compact && (
            <Link 
              href="/admin/content-review"
              className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            >
              <Eye size={14} />
              View All
            </Link>
          )}
        </div>
        {!compact && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-destructive/10 rounded">
                <AlertTriangle size={16} className="text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Needs Review</p>
                <p className="text-lg font-bold text-foreground">{stats.needs_review}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-warning/10 rounded">
                <Clock size={16} className="text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-lg font-bold text-foreground">{stats.in_progress}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-success/10 rounded">
                <CheckCircle size={16} className="text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved Today</p>
                <p className="text-lg font-bold text-foreground">{stats.approved_today}</p>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className={compact ? 'pt-0' : ''}>
        {reviewQueue.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle size={compact ? 32 : 48} className="text-success mx-auto mb-3" />
            <p className={`${compact ? 'text-base' : 'text-lg'} font-medium text-foreground`}>All caught up!</p>
            <p className="text-muted-foreground text-sm">No content waiting for review</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviewQueue.map((item) => (
              <div
                key={item.id}
                className={`border border-border rounded-lg ${compact ? 'p-3' : 'p-4'} hover:bg-muted/30 transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getPriorityIcon(item.priority, item.content_type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getContentTypeBadge(item.content_type)}
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(item.priority) === 'text-destructive' ? 'bg-destructive/10 text-destructive' : 
                          getPriorityColor(item.priority) === 'text-warning' ? 'bg-warning/10 text-warning' :
                          'bg-muted/30 text-muted-foreground'}`}>
                          {item.priority.toUpperCase()}
                        </span>
                      </div>
                      <h3 className={`font-medium text-foreground ${compact ? 'text-sm' : ''} truncate`}>{item.title}</h3>
                      <div className={`flex items-center gap-3 ${compact ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1`}>
                        <span>AI: {Math.round(item.ai_confidence_score * 100)}%</span>
                        <span>{formatTimeAgo(item.created_at)}</span>
                        <span>~{item.estimated_review_time}m</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Link 
                      href={`/admin/content-review/${item.id}`}
                      className={`bg-primary hover:bg-secondary text-white hover:text-black ${compact ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} rounded-lg font-medium transition-colors`}
                    >
                      Review
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
