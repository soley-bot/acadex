-- Fix missing DELETE policy for enrollments table
-- This allows admins to delete enrollments (unenroll students)

-- Add DELETE policy for admins (users with role 'admin')
CREATE POLICY "Admins can delete enrollments" ON public.enrollments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Add DELETE policy for users to delete their own enrollments (self-unenroll)
CREATE POLICY "Users can delete own enrollments" ON public.enrollments
  FOR DELETE USING (auth.uid() = user_id);
