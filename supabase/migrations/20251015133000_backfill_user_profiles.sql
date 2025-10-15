-- Migration: backfill user_profiles for existing auth.users
BEGIN;

-- Insert profile rows for auth.users that don't have one yet
INSERT INTO public.user_profiles (user_id, full_name, phone, created_at, updated_at)
SELECT
  u.id,
  (u.user_metadata ->> 'full_name')::text,
  (u.user_metadata ->> 'phone')::text,
  now(),
  now()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles p WHERE p.user_id = u.id
);

COMMIT;
