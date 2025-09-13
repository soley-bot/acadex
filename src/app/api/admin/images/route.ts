import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/api-auth'

export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url)
    const bucket = url.searchParams.get('bucket') || 'quiz-images'
    
    // Get list of files from the specified bucket
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list('', { 
        limit: 100, 
        sortBy: { column: 'created_at', order: 'desc' } 
      })
    
    if (error) {
      console.error('Storage list error:', error)
      return NextResponse.json(
        { error: 'Failed to list images', details: error.message },
        { status: 500 }
      )
    }
    
    // Filter for image files only
    const imageFiles = files?.filter((file: any) => 
      file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/)
    ) || []
    
    // Get public URLs for each image
    const imagesWithUrls = imageFiles.map((file: any) => {
      const { data } = supabase.storage.from(bucket).getPublicUrl(file.name)
      return {
        id: file.id,
        name: file.name,
        url: data.publicUrl,
        size: file.metadata?.size,
        lastModified: file.created_at,
        bucket
      }
    })
    
    return NextResponse.json({ 
      images: imagesWithUrls,
      total: imagesWithUrls.length,
      bucket
    })
    
  } catch (error) {
    console.error('Images API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})