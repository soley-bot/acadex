-- ===============================================
-- VIDEO STORAGE BUCKET SETUP FOR SUPABASE
-- ===============================================
-- This creates a storage bucket for video files
-- Run this in your Supabase SQL Editor

-- 1. Create the storage bucket for videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-videos',
  'course-videos',
  true,  -- public bucket for easy access
  524288000,  -- 500MB limit per file
  ARRAY[
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/mkv',
    'video/m4v',
    'video/3gp'
  ]::text[]
);

-- 2. Create RLS (Row Level Security) policies for the video bucket

-- Allow authenticated users to view videos
CREATE POLICY "Allow authenticated users to view videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'course-videos');

-- Allow admin and instructor users to upload videos
CREATE POLICY "Allow admin/instructor to upload videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-videos' 
  AND auth.uid() IN (
    SELECT id FROM users 
    WHERE role IN ('admin', 'instructor')
  )
);

-- Allow admin and instructor users to update video metadata
CREATE POLICY "Allow admin/instructor to update videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-videos' 
  AND auth.uid() IN (
    SELECT id FROM users 
    WHERE role IN ('admin', 'instructor')
  )
)
WITH CHECK (
  bucket_id = 'course-videos' 
  AND auth.uid() IN (
    SELECT id FROM users 
    WHERE role IN ('admin', 'instructor')
  )
);

-- Allow admin and instructor users to delete videos
CREATE POLICY "Allow admin/instructor to delete videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-videos' 
  AND auth.uid() IN (
    SELECT id FROM users 
    WHERE role IN ('admin', 'instructor')
  )
);

-- 3. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- EXAMPLE USAGE IN YOUR APPLICATION
-- ===============================================

/*
For YouTube links, you DON'T need storage - just save the URL directly:
- video_url: "https://www.youtube.com/watch?v=VIDEO_ID"
- video_url: "https://youtu.be/VIDEO_ID"

For uploaded videos, you'll store them in the bucket:
- Upload to: course-videos/[course-id]/[lesson-id]/video.mp4
- URL will be: https://[project].supabase.co/storage/v1/object/public/course-videos/[course-id]/[lesson-id]/video.mp4

Example video_url values:
- YouTube: "https://www.youtube.com/watch?v=fNof0CjjuRw&list=RDfNof0CjjuRw&start_radio=1"
- Uploaded: "https://yourproject.supabase.co/storage/v1/object/public/course-videos/course-123/lesson-456/video.mp4"
*/

-- ===============================================
-- VERIFICATION QUERIES
-- ===============================================

-- Check if bucket was created successfully
SELECT * FROM storage.buckets WHERE id = 'course-videos';

-- Check storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- ===============================================
-- OPTIONAL: CREATE HELPER FUNCTION FOR VIDEO URLS
-- ===============================================

-- Helper function to validate video URLs
CREATE OR REPLACE FUNCTION is_valid_video_url(url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Return true if it's a YouTube URL or a valid storage URL
  RETURN (
    url IS NULL OR
    url ~ '^https?://(www\.)?(youtube\.com/watch\?|youtu\.be/|vimeo\.com/)' OR
    url ~ '^https?://.*\.supabase\.co/storage/v1/object/public/course-videos/'
  );
END;
$$ LANGUAGE plpgsql;

-- Add a check constraint to course_lessons table (optional)
-- ALTER TABLE course_lessons 
-- ADD CONSTRAINT valid_video_url 
-- CHECK (is_valid_video_url(video_url));
