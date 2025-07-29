-- Debug queries to check course data
-- Replace 'dbc23169-b2a7-4640-82cf-35b668a95b7' with your actual course ID

-- 1. Check if the course exists and basic info
SELECT c.id, c.title, c.is_published, c.instructor_id, c.instructor_name
FROM courses c
WHERE c.id = 'dbc23169-b2a7-4640-82cf-35b668a95b7';

-- 2. Check course modules
SELECT cm.id, cm.title, cm.course_id, cm.order_index, cm.is_published
FROM course_modules cm
WHERE cm.course_id = 'dbc23169-b2a7-4640-82cf-35b668a95b7'
ORDER BY cm.order_index;

-- 3. Check course lessons
SELECT cl.id, cl.title, cl.module_id, cl.order_index, cl.is_published, cm.title as module_title
FROM course_lessons cl
JOIN course_modules cm ON cl.module_id = cm.id
WHERE cm.course_id = 'dbc23169-b2a7-4640-82cf-35b668a95b7'
ORDER BY cm.order_index, cl.order_index;

-- 4. Check complete structure
SELECT c.title as course_title,
       cm.title as module_title,
       cl.title as lesson_title,
       cm.order_index as module_order,
       cl.order_index as lesson_order
FROM courses c
LEFT JOIN course_modules cm ON c.id = cm.course_id
LEFT JOIN course_lessons cl ON cm.id = cl.module_id
WHERE c.id = 'dbc23169-b2a7-4640-82cf-35b668a95b7'
ORDER BY cm.order_index, cl.order_index;

-- 5. Check enrollments for current user
SELECT e.*, u.email
FROM enrollments e
JOIN auth.users u ON e.user_id = u.id
WHERE e.course_id = 'dbc23169-b2a7-4640-82cf-35b668a95b7';

-- 6. Check current authenticated user
SELECT auth.uid() as current_user_id;

-- 7. Test the exact query used by getCourseWithModulesAndLessons
SELECT 
  c.*,
  json_agg(
    json_build_object(
      'id', cm.id,
      'title', cm.title,
      'description', cm.description,
      'order_index', cm.order_index,
      'is_published', cm.is_published,
      'course_lessons', (
        SELECT json_agg(
          json_build_object(
            'id', cl.id,
            'title', cl.title,
            'description', cl.description,
            'content', cl.content,
            'video_url', cl.video_url,
            'duration_minutes', cl.duration_minutes,
            'order_index', cl.order_index,
            'is_published', cl.is_published,
            'is_free_preview', cl.is_free_preview
          )
          ORDER BY cl.order_index
        )
        FROM course_lessons cl
        WHERE cl.module_id = cm.id
      )
    )
    ORDER BY cm.order_index
  ) as modules
FROM courses c
LEFT JOIN course_modules cm ON c.id = cm.course_id
WHERE c.id = 'dbc23169-b2a7-4640-82cf-35b668a95b7'
GROUP BY c.id;
