-- Allow public read access to published courses for the homepage
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;

CREATE POLICY "Anyone can view published courses" ON courses
  FOR SELECT 
  USING (is_published = true);

-- Also ensure the getPopularCourses query works by testing it manually
SELECT 
  id,
  title,
  description,
  category,
  level,
  duration,
  price,
  instructor_id,
  instructor_name,
  status,
  is_free,
  is_published,
  created_at,
  updated_at,
  student_count,
  rating,
  image_url
FROM courses 
WHERE is_published = true 
ORDER BY created_at DESC 
LIMIT 6;
