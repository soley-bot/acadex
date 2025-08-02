-- Add image_url column to quizzes table
ALTER TABLE public.quizzes ADD COLUMN image_url TEXT;

-- Add index for better performance (optional)
CREATE INDEX idx_quizzes_image_url ON public.quizzes(image_url) WHERE image_url IS NOT NULL;
