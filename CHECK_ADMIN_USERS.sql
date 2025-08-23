-- QUICK ADMIN USER DIAGNOSTIC
-- Run this first to see what admin users you have

-- 1. Check all users in auth.users
SELECT 
  'AUTH TABLE' as source,
  id,
  email,
  email_confirmed_at IS NOT NULL as email_confirmed,
  last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check users in public.users with their roles
SELECT 
  'PUBLIC TABLE' as source,
  u.id,
  u.email,
  p.role,
  p.name,
  p.created_at
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;

-- 3. Find admin users specifically
SELECT 
  'ADMIN USERS' as source,
  au.email,
  pu.role,
  pu.name,
  au.last_sign_in_at
FROM auth.users au
JOIN public.users pu ON au.id = pu.id
WHERE pu.role = 'admin';

-- 4. Check if any user record is missing in public.users
SELECT 
  'MISSING USERS' as source,
  au.id,
  au.email,
  'No record in public.users' as issue
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- IF YOU NEED TO CREATE AN ADMIN USER, USE THIS:
-- (Replace 'your-email@domain.com' with your actual email)

-- Step 1: First check if the user exists in auth.users
-- SELECT id, email FROM auth.users WHERE email = 'your-email@domain.com';

-- Step 2: If user exists in auth but not in public.users, insert them:
-- INSERT INTO public.users (id, email, role, name)
-- SELECT id, email, 'admin', 'Admin User'
-- FROM auth.users 
-- WHERE email = 'your-email@domain.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Step 3: If user exists in both, just update role:
-- UPDATE public.users SET role = 'admin' 
-- WHERE email = 'your-email@domain.com';
