import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing content review database access...')

    // Test 1: Check if content_reviews table exists
    const { data: contentReviews, error: contentError } = await supabase
      .from('content_reviews')
      .select('*')
      .limit(5)

    console.log('Content reviews test:', { 
      success: !contentError, 
      error: contentError?.message,
      count: contentReviews?.length 
    })

    // Test 2: Check if priority_review_queue view exists
    const { data: queueData, error: queueError } = await supabase
      .from('priority_review_queue')
      .select('*')
      .limit(5)

    console.log('Priority queue test:', { 
      success: !queueError, 
      error: queueError?.message,
      count: queueData?.length 
    })

    // Test 3: Check if content_review_stats view exists
    const { data: statsData, error: statsError } = await supabase
      .from('content_review_stats')
      .select('*')
      .single()

    console.log('Stats view test:', { 
      success: !statsError, 
      error: statsError?.message,
      data: statsData 
    })

    return NextResponse.json({
      database_tests: {
        content_reviews: {
          success: !contentError,
          error: contentError?.message || null,
          count: contentReviews?.length || 0,
          sample: contentReviews?.[0] || null
        },
        priority_queue: {
          success: !queueError,
          error: queueError?.message || null,
          count: queueData?.length || 0,
          sample: queueData?.[0] || null
        },
        stats_view: {
          success: !statsError,
          error: statsError?.message || null,
          data: statsData || null
        }
      }
    })

  } catch (error: any) {
    console.error('Database test error:', error)
    return NextResponse.json({
      error: error.message,
      database_tests: {
        content_reviews: { success: false, error: error.message },
        priority_queue: { success: false, error: error.message },
        stats_view: { success: false, error: error.message }
      }
    }, { status: 500 })
  }
}
