-- Add unique constraint on orders.payment_reference to enforce idempotent order creation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_reference_key'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_payment_reference_key UNIQUE (payment_reference);
  END IF;
EXCEPTION WHEN duplicate_table OR duplicate_column THEN
  -- ignore if already exists
  RAISE NOTICE 'Constraint already exists';
END$$;
