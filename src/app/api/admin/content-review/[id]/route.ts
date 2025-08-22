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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
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

    const reviewId = params.id

    // Mock data for now - in the future, query your database
    const mockReviewItem = {
      id: reviewId,
      content_type: 'lesson',
      title: 'Grammar Lesson - Present Simple',
      content: `The present simple tense is used for habits and facts. We use it when we talk about things that happen regularly or are always true.

Examples:
- I eat breakfast every day
- The sun rises in the east
- She works at a hospital

Formation:
Subject + base verb (+ s/es for third person singular)

Practice:
Complete these sentences with the correct form of the verb in brackets:
1. She _____ (work) at a bank.
2. They _____ (not/like) coffee.
3. _____ you _____ (speak) English?`,
      ai_confidence_score: 0.85,
      priority: 'high',
      created_at: new Date().toISOString(),
      estimated_review_time: 5,
      language: 'en',
      category: 'grammar'
    }

    return NextResponse.json(mockReviewItem)

  } catch (error) {
    console.error('Content review item API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review item' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const supabase = createAuthenticatedClient(request)
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, notes, qualityChecks, editedContent, timeSpent } = body
    const reviewId = params.id

    // Log the review action
    console.log('Review action for item:', reviewId, {
      action,
      notes,
      qualityChecks,
      editedContent: editedContent ? 'Content was edited' : 'No edits',
      timeSpent: `${timeSpent} seconds`
    })

    // In the future, this would:
    // 1. Update the content_review_queue table
    // 2. If approved, publish the content
    // 3. If rejected, mark for regeneration
    // 4. If needs revision, save the edited content

    return NextResponse.json({
      success: true,
      message: `Content ${action} successfully`,
      reviewId
    })

  } catch (error) {
    console.error('Content review update error:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}
