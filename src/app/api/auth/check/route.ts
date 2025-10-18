import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-auth'

export const GET = withAdminAuth(async (request: NextRequest, user) => {
  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  })
})
