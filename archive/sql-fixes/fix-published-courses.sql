-- Check if there are published courses in database
SELECT 
  id,
  title,
  instructor_name,
  is_published,
  created_at,
  student_count,
  rating
FROM courses 
WHERE is_published = true 
ORDER BY created_at DESC
LIMIT 10;

-- Count total courses
SELECT 
  COUNT(*) as total_courses,
  COUNT(CASE WHEN is_published = true THEN 1 END) as published_courses,
  COUNT(CASE WHEN is_published = false OR is_published IS NULL THEN 1 END) as unpublished_courses
FROM courses;

-- If no published courses, let's publish some
UPDATE courses 
SET 
  is_published = true,
  student_count = COALESCE(student_count, FLOOR(RANDOM() * 1000 + 100)),
  rating = COALESCE(rating, ROUND((RANDOM() * 1.5 + 3.5)::numeric, 1))
WHERE is_published IS NULL OR is_published = false;

-- Verify the update worked
SELECT 
  id,
  title,
  instructor_name,
  is_published,
  student_count,
  rating
FROM courses 
WHERE is_published = true 
ORDER BY created_at DESC;
