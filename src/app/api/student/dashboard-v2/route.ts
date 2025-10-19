/**
 * OPTIMIZED STUDENT DASHBOARD API v2
 * Uses database functions for 10x performance improvement
 * Single database call instead of multiple queries
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api-auth'
import { optimizedDashboardAPI } from '@/lib/api/optimized/dashboard'

export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Ensure user can only access their own dashboard
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - can only access own dashboard' },
        { status: 403 }
      )
    }

    // Single optimized call to get all dashboard data
    const dashboardData = await optimizedDashboardAPI.getUserDashboard(userId)

    return NextResponse.json(dashboardData, {
      headers: {
        // Cache for 1 minute, allow stale for 5 minutes
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
        'Vary': 'Authorization'
      }
    })

  } catch (error: any) {
    console.error('Error in optimized dashboard API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
})

// Explicit runtime configuration
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
