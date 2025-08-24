import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Create service client for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get distinct categories from published quizzes
    const { data: categories, error } = await supabase
      .from('quizzes')
      .select('category')
      .eq('is_published', true)
      .not('category', 'is', null)
      .order('category')

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

    // Extract unique categories
    const uniqueCategories = [...new Set(categories.map(quiz => quiz.category))]
      .filter(Boolean)
      .sort()

    return NextResponse.json({ categories: uniqueCategories })
  } catch (error) {
    console.error('Error in quiz-categories route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
