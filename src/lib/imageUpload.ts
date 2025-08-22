// Utility functions for uploading images to Supabase Storage
import { supabase } from './supabase'

export interface ImageUploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Upload an image to Supabase Storage with timeout and better error handling
 */
export async function uploadImage(
  file: File,
  bucket: 'course-images' | 'quiz-images' | 'user-avatars' | 'lesson-resources',
  folder?: string
): Promise<ImageUploadResult> {
  console.log('🚀 [IMAGE_UPLOAD] Starting upload:', { 
    fileName: file.name, 
    fileSize: file.size, 
    bucket, 
    folder 
  })
  
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('❌ [IMAGE_UPLOAD] Invalid file type:', file.type)
      return { success: false, error: 'Please select an image file' }
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.error('❌ [IMAGE_UPLOAD] File too large:', file.size)
      return { success: false, error: 'Image size must be less than 5MB' }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExtension}`
    
    // Create file path
    const filePath = folder ? `${folder}/${fileName}` : fileName
    
    console.log('📁 [IMAGE_UPLOAD] Upload path:', filePath)

    // Create upload promise with timeout
    const uploadPromise = supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000)
    })

    console.log('⏳ [IMAGE_UPLOAD] Starting upload with 30s timeout...')
    
    // Race between upload and timeout
    const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any

    if (error) {
      console.error('❌ [IMAGE_UPLOAD] Storage upload error:', error)
      
      // Provide more specific error messages
      if (error.message?.includes('not found')) {
        return { success: false, error: 'Storage bucket not found. Please contact administrator.' }
      }
      if (error.message?.includes('permission')) {
        return { success: false, error: 'Permission denied. Please contact administrator.' }
      }
      if (error.message?.includes('timeout')) {
        return { success: false, error: 'Upload timed out. Please try again with a smaller image.' }
      }
      
      return { success: false, error: `Upload failed: ${error.message}` }
    }

    console.log('✅ [IMAGE_UPLOAD] Upload successful:', data?.path)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    console.log('🔗 [IMAGE_UPLOAD] Generated public URL:', publicUrl)

    return { success: true, url: publicUrl }

  } catch (error: any) {
    console.error('💥 [IMAGE_UPLOAD] Unexpected error:', error)
    
    if (error.message?.includes('timeout')) {
      return { success: false, error: 'Upload timed out. Please try again with a smaller image.' }
    }
    
    return { success: false, error: 'An unexpected error occurred during upload' }
  }
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImage(
  url: string,
  bucket: 'course-images' | 'quiz-images' | 'user-avatars' | 'lesson-resources'
): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = url.split(`/storage/v1/object/public/${bucket}/`)
    if (urlParts.length !== 2) {
      console.error('Invalid image URL format')
      return false
    }

    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('Storage delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Image delete error:', error)
    return false
  }
}

/**
 * Get signed URL for private images (if needed)
 */
export async function getSignedImageUrl(
  path: string,
  bucket: 'course-images' | 'quiz-images' | 'user-avatars' | 'lesson-resources',
  expiresIn: number = 3600 // 1 hour default
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error('Signed URL error:', error)
      return null
    }

    return data.signedUrl
  } catch (error) {
    console.error('Get signed URL error:', error)
    return null
  }
}
