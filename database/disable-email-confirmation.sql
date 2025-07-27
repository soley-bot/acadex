-- Disable email confirmation for easier user onboarding
-- This makes signup immediate without requiring email verification

-- Update Supabase Auth settings to disable email confirmation
-- You can also do this in the Supabase Dashboard:
-- 1. Go to Authentication > Settings
-- 2. Scroll to "Email confirmation" 
-- 3. Toggle OFF "Enable email confirmations"

-- OR run this SQL if you prefer:
-- Note: This requires superuser privileges and may not work in hosted Supabase
-- UPDATE auth.config SET enable_signup = true, enable_email_confirmations = false;

-- Alternative: Create a trigger to auto-confirm users
CREATE OR REPLACE FUNCTION public.auto_confirm_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm all new signups
  NEW.email_confirmed_at = NOW();
  NEW.confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS auto_confirm_users_trigger ON auth.users;

-- Create trigger to auto-confirm users on signup
CREATE TRIGGER auto_confirm_users_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_users();

-- Note: This trigger will auto-confirm ALL new signups
-- Both public signups and admin-created users will be immediately active
