-- Add unique constraint on orders.payment_reference if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_payment_reference'
  ) THEN
    ALTER TABLE public.orders
    ADD CONSTRAINT unique_payment_reference UNIQUE (payment_reference);
  END IF;
EXCEPTION WHEN duplicate_object THEN
  -- constraint already exists or created concurrently; ignore
END$$;
-- Idempotent migration: ensure orders.payment_reference is unique
ALTER TABLE IF EXISTS orders DROP CONSTRAINT IF EXISTS orders_payment_reference_unique;
ALTER TABLE IF EXISTS orders ADD CONSTRAINT orders_payment_reference_unique UNIQUE (payment_reference);
