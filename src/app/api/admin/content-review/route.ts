import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Helper function to create authenticated Supabase client
function createAuthenticatedClient(request: NextRequest) {
  // Try to get the auth token from Authorization header first
  const authHeader = request.headers.get('authorization')
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        },
        auth: {
          persistSession: false
        },
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {}
        }
      }
    )
  }

  // Fallback to cookie-based auth for browser requests
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const value = request.cookies.get(name)?.value
          return value || ''
        },
        set: () => {},
        remove: () => {}
      }
    }
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createAuthenticatedClient(request)
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user role
    const { data: userRole } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userRole || userRole.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // For now, return mock data
    // In the future, this would query your content_review_queue table
    const mockReviewQueue = [
      {
        id: '1',
        content_type: 'lesson',
        title: 'Grammar Lesson - Present Simple',
        ai_confidence_score: 0.85,
        priority: 'high',
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        estimated_review_time: 5
      },
      {
        id: '2',
        content_type: 'quiz',
        title: 'Quiz Questions - Verb Forms',
        ai_confidence_score: 0.92,
        priority: 'medium',
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        estimated_review_time: 3
      },
      {
        id: '3',
        content_type: 'lesson',
        title: 'Conversation Practice - Ordering Food',
        ai_confidence_score: 0.78,
        priority: 'low',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        estimated_review_time: 7
      }
    ]

    const mockStats = {
      needs_review: 3,
      in_progress: 1,
      approved_today: 12,
      avg_review_time: 3.2,
      quality_score: 8.7
    }

    return NextResponse.json({
      reviewQueue: mockReviewQueue,
      stats: mockStats
    })

  } catch (error) {
    console.error('Content review API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAuthenticatedClient(request)
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, reviewId, notes, qualityChecks } = body

    // In the future, this would update your content_review_queue table
    console.log('Review action:', { action, reviewId, notes, qualityChecks })

    // Mock response for now
    return NextResponse.json({
      success: true,
      message: `Content ${action} successfully`
    })

  } catch (error) {
    console.error('Content review action error:', error)
    return NextResponse.json(
      { error: 'Failed to process review action' },
      { status: 500 }
    )
  }
}
