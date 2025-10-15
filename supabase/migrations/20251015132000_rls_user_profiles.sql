-- Enable RLS and create policies for user_profiles
BEGIN;

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select their own profile
CREATE POLICY "Select own profile" ON public.user_profiles
  FOR SELECT
  USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Allow authenticated users to insert their own profile
CREATE POLICY "Insert own profile" ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Allow authenticated users to update their own profile
CREATE POLICY "Update own profile" ON public.user_profiles
  FOR UPDATE
  USING (auth.role() = 'authenticated' AND user_id = auth.uid())
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

COMMIT;
