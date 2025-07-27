import { supabase } from './supabase'

export interface UploadResult {
  url: string | null
  error: string | null
}

// Storage bucket names
export const STORAGE_BUCKETS = {
  COURSE_IMAGES: 'course-images',
  QUIZ_IMAGES: 'quiz-images',
  USER_AVATARS: 'user-avatars',
  LESSON_RESOURCES: 'lesson-resources'
} as const

// Upload file to Supabase Storage
export async function uploadFile(
  file: File,
  bucket: string,
  path: string
): Promise<UploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { url: null, error: 'Only image files are allowed' }
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return { url: null, error: 'File size must be less than 5MB' }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${path}/${fileName}`

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return { url: null, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return { url: urlData.publicUrl, error: null }
  } catch (err) {
    console.error('Upload error:', err)
    return { url: null, error: 'Failed to upload file' }
  }
}

// Delete file from Supabase Storage
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Delete error:', err)
    return false
  }
}

// Get optimized image URL with transformations
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: {
    width?: number
    height?: number
    quality?: number
  } = {}
): string {
  // If no URL provided, return a proper placeholder URL
  if (!url) {
    const width = options.width || 400
    const height = options.height || 300
    return `https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=${options.quality || 80}`
  }
  
  // If it's already a Supabase URL, add transformations
  if (url.includes('supabase')) {
    const params = new URLSearchParams()
    if (options.width) params.append('width', options.width.toString())
    if (options.height) params.append('height', options.height.toString())
    if (options.quality) params.append('quality', options.quality.toString())
    
    return params.toString() ? `${url}?${params.toString()}` : url
  }
  
  // Return the URL as-is (external URLs like Unsplash)
  return url
}

// Course image upload helper
export async function uploadCourseImage(file: File, courseId: string): Promise<UploadResult> {
  return uploadFile(file, STORAGE_BUCKETS.COURSE_IMAGES, `courses/${courseId}`)
}

// Quiz image upload helper  
export async function uploadQuizImage(file: File, quizId: string): Promise<UploadResult> {
  return uploadFile(file, STORAGE_BUCKETS.QUIZ_IMAGES, `quizzes/${quizId}`)
}

// User avatar upload helper
export async function uploadUserAvatar(file: File, userId: string): Promise<UploadResult> {
  return uploadFile(file, STORAGE_BUCKETS.USER_AVATARS, `users/${userId}`)
}
