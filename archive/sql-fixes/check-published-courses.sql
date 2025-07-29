-- Check existing published courses
SELECT 
  id,
  title,
  description,
  category,
  level,
  duration,
  price,
  instructor_name,
  is_published,
  student_count,
  rating,
  created_at
FROM courses 
WHERE is_published = true 
ORDER BY created_at DESC;

-- If no published courses, let's see all courses
SELECT 
  id,
  title,
  is_published,
  instructor_name,
  created_at
FROM courses 
ORDER BY created_at DESC;

-- Check if we need to publish some courses
UPDATE courses 
SET is_published = true 
WHERE is_published = false OR is_published IS NULL;
