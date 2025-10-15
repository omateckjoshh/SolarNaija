-- Migration: create user_profiles table
-- Purpose: store richer profile data linked to Supabase auth.users

BEGIN;

-- Create table to store per-user profile details
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone varchar(32),
  avatar_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Optional index for lookup by phone
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON public.user_profiles (phone);

-- Function to set updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Trigger to update updated_at on row update
DROP TRIGGER IF EXISTS trg_set_updated_at ON public.user_profiles;
CREATE TRIGGER trg_set_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at();

COMMIT;
