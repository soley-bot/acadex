import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/api-auth'

export async function GET() {
  try {
    // Create service client for server-side operations
    const supabase = createServiceClient()

    // Get distinct categories from published courses
    const { data: courses, error } = await supabase
      .from('courses')
      .select('category')
      .eq('is_published', true)
      .not('category', 'is', null)

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

    // Extract unique categories
    const categories = Array.from(
      new Set(
        courses
          ?.map(course => course.category)
          .filter(category => category !== null && category !== '')
      )
    ).sort()

    return NextResponse.json({ categories })

  } catch (error) {
    console.error('Error in categories API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}