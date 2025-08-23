import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { contentReviewService } from '@/lib/content-review-system'

// Test endpoint for the Content Review System
export async function POST(request: NextRequest) {
  try {
    const { content, quizRequest } = await request.json()

    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'Content is required for review'
      }, { status: 400 })
    }

    logger.info('Content review API test', {
      contentLength: content.length,
      hasRequest: !!quizRequest
    })

    // Run content review
    const reviewResult = await contentReviewService.reviewQuizContent(content, quizRequest || {})

    return NextResponse.json({
      success: true,
      reviewResult: {
        isValid: reviewResult.isValid,
        confidence: reviewResult.confidence,
        issues: reviewResult.issues,
        recommendations: reviewResult.recommendations,
        hasCorrectedContent: !!reviewResult.correctedContent
      },
      // Include corrected content if available (for testing)
      ...(reviewResult.correctedContent && {
        correctedContent: reviewResult.correctedContent
      })
    })

  } catch (error: any) {
    logger.error('Content review API test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Content review failed'
    }, { status: 500 })
  }
}

// GET endpoint to test basic functionality
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Content Review System API is operational',
    features: [
      'JSON structure validation',
      'Content quality review',
      'Educational standards check',
      'Language appropriateness validation',
      'Auto-correction capabilities',
      'Multi-attempt generation with retry logic'
    ]
  })
}
