import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/api-auth'
import rateLimiter, { getClientIdentifier, RateLimitPresets } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting - 300 requests per minute per IP
    const clientId = getClientIdentifier(request)
    const rateLimitResult = rateLimiter.check(
      clientId,
      RateLimitPresets.relaxed.limit,
      RateLimitPresets.relaxed.windowMs
    )

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Please slow down. Try again in a moment.',
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter || 60),
            'X-RateLimit-Limit': String(RateLimitPresets.relaxed.limit),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetAt).toISOString(),
          },
        }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '9')
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const search = searchParams.get('search')

    // Create service client for server-side operations
    const supabase = createServiceClient()

    let query = supabase
      .from('courses')
      .select('*', { count: 'exact' })
      .eq('is_published', true) // Only show published courses

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }

    if (level) {
      query = query.eq('level', level)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: courses, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching courses:', error)
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: 500 }
      )
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json(
      {
        data: courses || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasMore: page < totalPages,
        },
      },
      {
        headers: {
          'X-RateLimit-Limit': String(RateLimitPresets.relaxed.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetAt).toISOString(),
        },
      }
    )

  } catch (error: any) {
    console.error('Error in courses API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}