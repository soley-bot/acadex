-- Create an enrollment for testing (replace IDs with actual values)
-- You can get your user ID from the debug query above

INSERT INTO enrollments (
  user_id, 
  course_id, 
  enrolled_at, 
  progress
) VALUES (
  (SELECT auth.uid()), -- Your current user ID
  'dbc23169-b2a7-4640-82cf-35b668a95b7', -- Replace with your course ID
  NOW(),
  0
)
ON CONFLICT (user_id, course_id) DO NOTHING;
