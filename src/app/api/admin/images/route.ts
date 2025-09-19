import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { withAdminAuth } from '@/lib/api-auth'

export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url)
    const bucket = url.searchParams.get('bucket') || 'quiz-images'
    
    console.log(`📁 [ADMIN_IMAGES_API] Loading from bucket: ${bucket}`)
    
    let allImages: any[] = []
    
    // Define folders to check for each bucket type
    const foldersToCheck = {
      'quiz-images': ['', 'quizzes'], // Root and quizzes folder
      'course-images': ['', 'courses'], // Root and courses folder  
      'user-avatars': ['', 'users'], // Root and users folder
      'lesson-resources': ['', 'lessons', 'resources'] // Root and common folders
    }
    
    const folders = foldersToCheck[bucket as keyof typeof foldersToCheck] || ['']
    
    // Check each folder for images
    for (const folder of folders) {
      try {
        console.log(`📂 [ADMIN_IMAGES_API] Checking folder: ${folder || 'root'} in bucket ${bucket}`)
        
        const { data: files, error } = await supabase.storage
          .from(bucket)
          .list(folder, { 
            limit: 100, 
            sortBy: { column: 'created_at', order: 'desc' } 
          })
        
        if (error) {
          console.error(`❌ [ADMIN_IMAGES_API] Error listing folder ${folder}:`, error)
          continue // Skip this folder and try others
        }
        
        if (files && files.length > 0) {
          console.log(`📋 [ADMIN_IMAGES_API] Found ${files.length} files in folder ${folder || 'root'}`)
          
          // Filter for image files only
          const imageFiles = files.filter((file: any) => 
            file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/)
          )
          
          console.log(`🖼️ [ADMIN_IMAGES_API] Filtered to ${imageFiles.length} image files`)
          
          // Get public URLs for each image
          const imagesWithUrls = imageFiles.map((file: any) => {
            const filePath = folder ? `${folder}/${file.name}` : file.name
            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
            
            return {
              id: file.id || `${bucket}-${folder || 'root'}-${file.name}`,
              name: file.name,
              url: data.publicUrl,
              size: file.metadata?.size,
              lastModified: file.created_at,
              bucket,
              folder: folder || 'root',
              path: filePath
            }
          })
          
          allImages.push(...imagesWithUrls)
        }
      } catch (folderError) {
        console.error(`❌ [ADMIN_IMAGES_API] Error processing folder ${folder}:`, folderError)
        // Continue with other folders
      }
    }
    
    // Sort all images by creation date (newest first)
    allImages.sort((a, b) => {
      const dateA = new Date(a.lastModified || 0).getTime()
      const dateB = new Date(b.lastModified || 0).getTime()
      return dateB - dateA
    })
    
    console.log(`✅ [ADMIN_IMAGES_API] Total images found: ${allImages.length}`)
    
    return NextResponse.json({ 
      images: allImages,
      total: allImages.length,
      bucket,
      foldersChecked: folders
    })
    
  } catch (error) {
    console.error('Images API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})