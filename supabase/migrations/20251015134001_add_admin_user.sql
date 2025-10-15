-- Migration: add a specific admin user to admin_users
BEGIN;

INSERT INTO public.admin_users (user_id, role_text, created_at)
VALUES ('b9238286-5051-4703-a431-fd667c4de84f', 'admin', now())
ON CONFLICT (user_id) DO NOTHING;

COMMIT;
