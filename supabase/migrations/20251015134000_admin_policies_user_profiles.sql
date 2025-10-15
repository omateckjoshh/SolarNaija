-- Migration: add admin users table and policies to allow admins to read all profiles
BEGIN;

-- Create admin_users table to mark admin accounts
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role_text text DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Allow users in admin_users to select any user_profiles
DROP POLICY IF EXISTS "Select own profile" ON public.user_profiles;
CREATE POLICY "Select own or admin" ON public.user_profiles
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      user_id = auth.uid() OR auth.uid() IN (SELECT user_id FROM public.admin_users)
    )
  );

-- Keep the insert/update policies the same (owner-only)
-- Insert policy
DROP POLICY IF EXISTS "Insert own profile" ON public.user_profiles;
CREATE POLICY "Insert own profile" ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Update policy
DROP POLICY IF EXISTS "Update own profile" ON public.user_profiles;
CREATE POLICY "Update own profile" ON public.user_profiles
  FOR UPDATE
  USING (auth.role() = 'authenticated' AND user_id = auth.uid())
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

COMMIT;
