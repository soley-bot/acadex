import { NextRequest, NextResponse } from 'next/server'

// Placeholder for batch import functionality
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Batch import not implemented yet' },
    { status: 501 }
  )
}