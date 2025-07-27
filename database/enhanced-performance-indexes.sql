-- ===============================================
-- ENHANCED PERFORMANCE INDEXES
-- Run ONLY if you have the enhanced course structure
-- (course_modules, course_lessons, lesson_progress tables)
-- ===============================================

-- Check if enhanced tables exist first:
-- SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_modules');

-- 📚 Course structure indexes (for enhanced course navigation)
CREATE INDEX IF NOT EXISTS idx_course_modules_course_order ON course_modules(course_id, order_index);

CREATE INDEX IF NOT EXISTS idx_course_lessons_module_order ON course_lessons(module_id, order_index);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON lesson_progress(user_id, lesson_id);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_completion ON lesson_progress(user_id, is_completed, completed_at DESC);

-- 📚 Course resources indexes
CREATE INDEX IF NOT EXISTS idx_course_resources_course ON course_resources(course_id);

CREATE INDEX IF NOT EXISTS idx_course_resources_lesson ON course_resources(lesson_id);

-- ===============================================
-- ANALYZE ENHANCED TABLES
-- ===============================================

ANALYZE course_modules;
ANALYZE course_lessons;
ANALYZE lesson_progress;
ANALYZE course_resources;

-- ===============================================
-- ENHANCED QUERY EXAMPLES
-- ===============================================

/*
-- Fast course with modules and lessons (uses indexes)
SELECT 
  c.*,
  (SELECT json_agg(
    json_build_object(
      'id', cm.id,
      'title', cm.title,
      'order_index', cm.order_index,
      'lessons', (
        SELECT json_agg(
          json_build_object(
            'id', cl.id,
            'title', cl.title,
            'duration_minutes', cl.duration_minutes,
            'order_index', cl.order_index
          ) ORDER BY cl.order_index
        )
        FROM course_lessons cl 
        WHERE cl.module_id = cm.id AND cl.is_published = true
      )
    ) ORDER BY cm.order_index
  ) FROM course_modules cm WHERE cm.course_id = c.id AND cm.is_published = true) as modules
FROM courses c
WHERE c.id = $1 AND c.is_published = true;

-- Fast user progress across all courses (uses indexes)
SELECT 
  c.id,
  c.title,
  COUNT(cl.id) as total_lessons,
  COUNT(lp.id) FILTER (WHERE lp.is_completed = true) as completed_lessons,
  ROUND(
    (COUNT(lp.id) FILTER (WHERE lp.is_completed = true) * 100.0) / NULLIF(COUNT(cl.id), 0), 
    2
  ) as progress_percentage
FROM courses c
JOIN course_modules cm ON cm.course_id = c.id
JOIN course_lessons cl ON cl.module_id = cm.id
LEFT JOIN lesson_progress lp ON lp.lesson_id = cl.id AND lp.user_id = $1
WHERE c.is_published = true
GROUP BY c.id, c.title
ORDER BY progress_percentage DESC;
*/
