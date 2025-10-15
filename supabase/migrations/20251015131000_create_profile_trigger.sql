-- Migration: create trigger to auto-create user_profiles on auth.users insert
BEGIN;

-- Function to insert a profile row when a new auth user is created
CREATE OR REPLACE FUNCTION auth.create_user_profile()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- Try to create a blank profile row; if it exists, do nothing
  INSERT INTO public.user_profiles (user_id, created_at, updated_at)
  VALUES (NEW.id, now(), now())
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users after insert
DROP TRIGGER IF EXISTS create_user_profile ON auth.users;
CREATE TRIGGER create_user_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE auth.create_user_profile();

COMMIT;
