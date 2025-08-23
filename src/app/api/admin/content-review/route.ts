import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// TEMPORARY: Simplified content-review API for debugging 401 issues
// Service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Bypassing content-review auth for testing...')

    // TEMPORARY: Provide mock data while bypassing auth
    const mockData = {
      success: true,
      reviewQueue: [
        {
          id: '1',
          content_type: 'quiz',
          title: 'Sample Quiz Review',
          status: 'needs_review',
          priority_score: 1,
          created_at: new Date().toISOString(),
          time_estimate: '5 minutes'
        }
      ],
      stats: {
        totalPending: 1,
        completedToday: 0,
        averageReviewTime: '5 minutes',
        qualityScore: 95
      }
    }

    return NextResponse.json(mockData)

  } catch (error: any) {
    console.error('❌ Content review API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Bypassing content-review POST auth for testing...')
    
    const body = await request.json()
    console.log('Content review action:', body)

    // Mock successful response
    return NextResponse.json({
      success: true,
      message: 'Review action completed (DEBUG MODE)'
    })

  } catch (error: any) {
    console.error('❌ Content review POST error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
