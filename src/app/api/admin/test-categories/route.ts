import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Helper function to create admin client
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function GET() {
  try {
    const supabase = createAdminClient()
    // Test reading categories
    const { data: categories, error: readError } = await supabase
      .from('categories')
      .select('*')
      .limit(5)

    if (readError) {
      console.error('Read error:', readError)
      return NextResponse.json({ 
        success: false, 
        error: readError.message,
        operation: 'read'
      })
    }

    return NextResponse.json({
      success: true,
      operation: 'read',
      count: categories?.length || 0,
      categories: categories || []
    })
  } catch (error: any) {
    console.error('Test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      operation: 'general'
    })
  }
}

export async function POST() {
  try {
    const supabase = createAdminClient()
    // Test creating a category
    const testCategory = {
      name: `Test Category ${Date.now()}`,
      description: 'Test category for debugging',
      color: '#6366f1',
      icon: 'folder',
      type: 'general'
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([testCategory])
      .select()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        operation: 'create',
        details: error
      })
    }

    return NextResponse.json({
      success: true,
      operation: 'create',
      category: data?.[0] || null
    })
  } catch (error: any) {
    console.error('Test create error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      operation: 'create'
    })
  }
}
