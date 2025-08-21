-- Fix users table column name to match TypeScript interface
-- Change full_name to name for consistency

-- Rename the column from full_name to name
ALTER TABLE public.users 
RENAME COLUMN full_name TO name;

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
