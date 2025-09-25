import { NextRequest, NextResponse } from 'next/server'

// Valid web vital metric names
const VALID_METRICS = ['CLS', 'INP', 'FCP', 'LCP', 'TTFB'] as const
type ValidMetric = typeof VALID_METRICS[number]

// Valid rating values
const VALID_RATINGS = ['good', 'needs-improvement', 'poor'] as const
type ValidRating = typeof VALID_RATINGS[number]

interface WebVitalData {
  metric: ValidMetric
  value: number
  rating: ValidRating
  delta: number
  url: string
  timestamp: number
  userAgent?: string
  connection?: string
}

function validateWebVitalData(data: any): data is WebVitalData {
  return (
    typeof data === 'object' &&
    data !== null &&
    VALID_METRICS.includes(data.metric) &&
    typeof data.value === 'number' &&
    data.value >= 0 &&
    VALID_RATINGS.includes(data.rating) &&
    typeof data.delta === 'number' &&
    typeof data.url === 'string' &&
    data.url.length > 0 &&
    data.url.length <= 2048 &&
    typeof data.timestamp === 'number' &&
    data.timestamp > 0 &&
    Math.abs(Date.now() - data.timestamp) < 60000 // Within last minute
  )
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check (simple implementation)
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    
    // Parse and validate request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    // Validate the web vital data
    if (!validateWebVitalData(body)) {
      return NextResponse.json({ error: 'Invalid web vital data' }, { status: 400 })
    }

    // Sanitize user agent
    const sanitizedUserAgent = body.userAgent?.substring(0, 100).replace(/[<>]/g, '') || 'unknown'
    
    // Log web vitals data (in production, you might want to store this in a database)
    if (process.env.NODE_ENV === 'development') {
      console.log('Web Vitals:', {
        metric: body.metric,
        value: body.value,
        rating: body.rating,
        delta: body.delta,
        url: body.url,
        timestamp: new Date(body.timestamp).toISOString(),
        userAgent: sanitizedUserAgent,
        connection: body.connection,
        clientIP
      })
    }

    // In production, you might want to:
    // 1. Store metrics in a database
    // 2. Send to external analytics service
    // 3. Process for performance monitoring
    
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Web vitals endpoint error:', error)
    
    // Don't leak internal error details
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        error: 'Failed to process web vitals',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}