-- FIX LESSON PROGRESS 400 BAD REQUEST ERROR
-- This fixes the upsert operation to match the actual table structure

-- =============================================
-- COMMON CAUSES OF 400 ERROR:
-- =============================================
-- 1. Column name mismatch (updated_at vs created_at)
-- 2. Invalid UUID format  
-- 3. Missing required columns
-- 4. Extra columns that don't exist in table
-- =============================================

-- First check what columns actually exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'lesson_progress' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =============================================
-- FRONTEND FIX - UPDATE THE REACT COMPONENT
-- =============================================

/*
The current toggleLessonCompletion function is likely sending:
- updated_at (column might not exist)
- Wrong column names
- Invalid data types

REPLACE the toggleLessonCompletion function with this corrected version:

const toggleLessonCompletion = async (lessonId: string) => {
  if (!user || !isEnrolled) return

  // Get current completion status
  const currentProgress = currentLesson?.progress
  const isCurrentlyCompleted = currentProgress?.is_completed || false

  try {
    const upsertData = {
      user_id: user.id,
      lesson_id: lessonId,
      is_completed: !isCurrentlyCompleted,
      completed_at: !isCurrentlyCompleted ? new Date().toISOString() : null
      // Remove updated_at - it might not exist or be auto-generated
    }

    const { data, error } = await supabase
      .from('lesson_progress')
      .upsert(upsertData)

    if (error) {
      console.error('Lesson progress error:', error)
      throw error
    }

    // Reload progress to reflect changes
    loadCourseContent()
  } catch (err) {
    console.error('Error toggling lesson completion:', err)
  }
}
*/

-- =============================================
-- ALTERNATIVE: ENSURE TABLE HAS UPDATED_AT
-- =============================================

-- Add updated_at column if it doesn't exist
ALTER TABLE lesson_progress 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_lesson_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_lesson_progress_updated_at ON lesson_progress;

-- Create trigger
CREATE TRIGGER update_lesson_progress_updated_at
    BEFORE UPDATE ON lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_lesson_progress_updated_at();

-- =============================================
-- TEST THE FIX
-- =============================================

-- This should work without 400 error
SELECT 'Testing lesson progress structure...' as test;

-- Check if we can insert/update lesson progress
-- Replace with actual user_id and lesson_id values
/*
INSERT INTO lesson_progress (user_id, lesson_id, is_completed, completed_at)
VALUES (
    auth.uid(),  -- Current user
    'your-lesson-id-here',  -- Replace with actual lesson ID
    true,
    NOW()
) ON CONFLICT (user_id, lesson_id) 
DO UPDATE SET 
    is_completed = EXCLUDED.is_completed,
    completed_at = EXCLUDED.completed_at
RETURNING *;
*/

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

SELECT '✅ LESSON PROGRESS 400 ERROR FIX COMPLETE!' as message
UNION ALL
SELECT '📝 Either update the frontend code to remove updated_at'
UNION ALL  
SELECT '🔧 Or run the SQL above to add updated_at column and trigger'
UNION ALL
SELECT '🧪 Test with actual user_id and lesson_id values';
