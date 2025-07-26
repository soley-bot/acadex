-- SIMPLE ADMIN SETUP
-- Just run this after you sign up with any email

-- Replace 'YOUR_USER_ID_HERE' with the actual user ID from auth.users table
-- You can find it by running: SELECT id, email FROM auth.users;

UPDATE public.users 
SET role = 'admin' 
WHERE email = 'YOUR_EMAIL_HERE';

-- Example:
-- UPDATE public.users SET role = 'admin' WHERE email = 'test@example.com';

-- To check if it worked:
-- SELECT email, role FROM public.users WHERE role = 'admin';
