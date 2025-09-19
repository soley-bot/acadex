import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log web vitals data (in production, you might want to store this in a database)
    if (process.env.NODE_ENV === 'development') {
      console.log('Web Vitals:', {
        metric: body.metric,
        value: body.value,
        rating: body.rating,
        delta: body.delta,
        url: body.url,
        timestamp: new Date(body.timestamp).toISOString(),
        userAgent: body.userAgent?.substring(0, 100), // Truncate for logs
        connection: body.connection
      })
    }

    // In production, you might want to:
    // 1. Store metrics in a database
    // 2. Send to external analytics service
    // 3. Process for performance monitoring
    
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Web vitals endpoint error:', error)
    return NextResponse.json({ error: 'Failed to process web vitals' }, { status: 500 })
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}