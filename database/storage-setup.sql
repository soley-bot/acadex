-- =====================================================
-- SUPABASE STORAGE SETUP FOR ACADEX
-- =====================================================
-- Run this script in your Supabase SQL Editor to set up storage buckets
-- for course images, quiz images, user avatars, and lesson resources

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('course-images', 'course-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('quiz-images', 'quiz-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('user-avatars', 'user-avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('lesson-resources', 'lesson-resources', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[])
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for course-images bucket
CREATE POLICY "Course images are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-images');

CREATE POLICY "Instructors and admins can upload course images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'course-images' AND 
    (auth.role() = 'authenticated') AND
    (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('instructor', 'admin'))
    )
  );

CREATE POLICY "Instructors and admins can update course images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'course-images' AND 
    (auth.role() = 'authenticated') AND
    (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('instructor', 'admin'))
    )
  );

CREATE POLICY "Instructors and admins can delete course images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'course-images' AND 
    (auth.role() = 'authenticated') AND
    (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('instructor', 'admin'))
    )
  );

-- Create RLS policies for quiz-images bucket
CREATE POLICY "Quiz images are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'quiz-images');

CREATE POLICY "Instructors and admins can upload quiz images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'quiz-images' AND 
    (auth.role() = 'authenticated') AND
    (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('instructor', 'admin'))
    )
  );

CREATE POLICY "Instructors and admins can update quiz images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'quiz-images' AND 
    (auth.role() = 'authenticated') AND
    (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('instructor', 'admin'))
    )
  );

CREATE POLICY "Instructors and admins can delete quiz images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'quiz-images' AND 
    (auth.role() = 'authenticated') AND
    (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('instructor', 'admin'))
    )
  );

-- Create RLS policies for user-avatars bucket
CREATE POLICY "User avatars are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload their own avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND 
    (auth.role() = 'authenticated') AND
    (name LIKE 'users/' || auth.uid()::text || '%')
  );

CREATE POLICY "Users can update their own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-avatars' AND 
    (auth.role() = 'authenticated') AND
    (name LIKE 'users/' || auth.uid()::text || '%')
  );

CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-avatars' AND 
    (auth.role() = 'authenticated') AND
    (name LIKE 'users/' || auth.uid()::text || '%')
  );

-- Create RLS policies for lesson-resources bucket
CREATE POLICY "Lesson resources are viewable by enrolled users" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'lesson-resources' AND
    (
      -- Public resources or enrolled students can view
      auth.role() = 'authenticated'
    )
  );

CREATE POLICY "Instructors and admins can upload lesson resources" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'lesson-resources' AND 
    (auth.role() = 'authenticated') AND
    (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('instructor', 'admin'))
    )
  );

CREATE POLICY "Instructors and admins can update lesson resources" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'lesson-resources' AND 
    (auth.role() = 'authenticated') AND
    (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('instructor', 'admin'))
    )
  );

CREATE POLICY "Instructors and admins can delete lesson resources" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'lesson-resources' AND 
    (auth.role() = 'authenticated') AND
    (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('instructor', 'admin'))
    )
  );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if buckets were created successfully
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE id IN ('course-images', 'quiz-images', 'user-avatars', 'lesson-resources');

-- Check storage policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;
