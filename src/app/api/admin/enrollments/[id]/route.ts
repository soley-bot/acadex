import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for server-side operations (bypasses RLS) - same pattern as other working APIs
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
)

// DELETE - Remove an enrollment (unenroll student)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: enrollmentId } = await params
    console.log('Attempting to delete enrollment:', enrollmentId)

    // First, check if enrollment exists
    const { data: enrollment, error: fetchError } = await supabase
      .from('enrollments')
      .select('*')
      .eq('id', enrollmentId)
      .single()

    console.log('Enrollment fetch result:', { enrollment, fetchError })

    if (fetchError || !enrollment) {
      console.log('Enrollment not found:', fetchError)
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    // Delete the enrollment
    console.log('Attempting to delete enrollment...')
    const { error: deleteError } = await supabase
      .from('enrollments')
      .delete()
      .eq('id', enrollmentId)

    console.log('Delete result:', { deleteError })

    if (deleteError) {
      console.error('Database error:', deleteError)
      return NextResponse.json({ 
        error: 'Failed to delete enrollment', 
        details: deleteError.message 
      }, { status: 500 })
    }

    console.log('Enrollment deleted successfully')
    return NextResponse.json({ 
      success: true, 
      message: 'Student successfully unenrolled' 
    }, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update enrollment (e.g., progress, status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: enrollmentId } = await params
    const updates = await request.json()

    // Validate allowed fields
    const allowedFields = ['progress', 'completed_at', 'last_accessed_at', 'total_watch_time_minutes']
    const updateData: any = {}

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Update the enrollment
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .update(updateData)
      .eq('id', enrollmentId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update enrollment' }, { status: 500 })
    }

    return NextResponse.json({ enrollment })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
