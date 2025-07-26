-- Create a test admin user for development
-- This should be run after the database is set up

-- Insert admin user
INSERT INTO public.users (id, email, name, role, avatar_url) VALUES 
('550e8400-e29b-41d4-a716-446655440999', 'admin@acadex.com', 'Admin User', 'admin', null)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Note: This user ID should be used when creating a Supabase auth user
-- You can sign up with admin@acadex.com and then update the auth.users.id to match this ID
-- Or update this ID to match the auth.users.id after signup

COMMENT ON TABLE public.users IS 'Test admin user created for development';
