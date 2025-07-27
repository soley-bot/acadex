-- Efficient Course Creation/Update Function
-- This function handles all course operations in a single transaction
-- for much better performance

CREATE OR REPLACE FUNCTION save_course_with_content(
  course_data JSONB,
  modules_data JSONB,
  is_update BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(course_id UUID, success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_course_id UUID;
  v_module_record JSONB;
  v_lesson_record JSONB;
  v_module_id UUID;
  v_lesson_id UUID;
BEGIN
  -- Start transaction
  BEGIN
    -- Handle course creation/update
    IF is_update AND (course_data->>'id')::UUID IS NOT NULL THEN
      -- Update existing course
      v_course_id := (course_data->>'id')::UUID;
      
      UPDATE courses SET
        title = course_data->>'title',
        description = course_data->>'description',
        instructor_name = course_data->>'instructor_name',
        price = (course_data->>'price')::NUMERIC,
        category = course_data->>'category',
        level = course_data->>'level',
        duration = course_data->>'duration',
        image_url = NULLIF(course_data->>'image_url', ''),
        is_published = (course_data->>'is_published')::BOOLEAN,
        updated_at = (course_data->>'updated_at')::TIMESTAMP WITH TIME ZONE
      WHERE id = v_course_id;
      
      -- Delete existing modules and their cascading content
      -- This is more efficient than individual deletes
      DELETE FROM course_modules WHERE course_id = v_course_id;
      
    ELSE
      -- Create new course
      INSERT INTO courses (
        title, description, instructor_name, price, category, level, 
        duration, image_url, is_published, instructor_id, created_at, updated_at
      )
      VALUES (
        course_data->>'title',
        course_data->>'description', 
        course_data->>'instructor_name',
        (course_data->>'price')::NUMERIC,
        course_data->>'category',
        course_data->>'level',
        course_data->>'duration',
        NULLIF(course_data->>'image_url', ''),
        (course_data->>'is_published')::BOOLEAN,
        (course_data->>'instructor_id')::UUID,
        (course_data->>'updated_at')::TIMESTAMP WITH TIME ZONE,
        (course_data->>'updated_at')::TIMESTAMP WITH TIME ZONE
      )
      RETURNING id INTO v_course_id;
    END IF;

    -- Insert modules and lessons in batch
    FOR v_module_record IN SELECT * FROM jsonb_array_elements(modules_data)
    LOOP
      -- Insert module
      INSERT INTO course_modules (
        course_id, title, description, order_index, is_published, created_at, updated_at
      )
      VALUES (
        v_course_id,
        v_module_record->>'title',
        v_module_record->>'description',
        (v_module_record->>'order_index')::INTEGER,
        (v_module_record->>'is_published')::BOOLEAN,
        NOW(),
        NOW()
      )
      RETURNING id INTO v_module_id;

      -- Insert lessons for this module
      FOR v_lesson_record IN SELECT * FROM jsonb_array_elements(v_module_record->'lessons')
      LOOP
        INSERT INTO course_lessons (
          module_id, title, description, content, video_url, 
          duration_minutes, order_index, is_published, is_free_preview,
          created_at, updated_at
        )
        VALUES (
          v_module_id,
          v_lesson_record->>'title',
          v_lesson_record->>'description',
          v_lesson_record->>'content',
          NULLIF(v_lesson_record->>'video_url', ''),
          (v_lesson_record->>'duration_minutes')::INTEGER,
          (v_lesson_record->>'order_index')::INTEGER,
          (v_lesson_record->>'is_published')::BOOLEAN,
          (v_lesson_record->>'is_free_preview')::BOOLEAN,
          NOW(),
          NOW()
        );
      END LOOP;
    END LOOP;

    -- Return success
    RETURN QUERY SELECT v_course_id, TRUE, 'Course saved successfully'::TEXT;

  EXCEPTION WHEN OTHERS THEN
    -- Return error
    RETURN QUERY SELECT NULL::UUID, FALSE, SQLERRM::TEXT;
  END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION save_course_with_content TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION save_course_with_content IS 
'Efficiently saves course with all modules and lessons in a single transaction for better performance';
