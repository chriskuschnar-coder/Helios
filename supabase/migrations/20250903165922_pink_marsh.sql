/*
  # Add transaction_hash column to payments table

  1. New Columns
    - `transaction_hash` (text, nullable) - Stores blockchain transaction hashes for crypto payments
  
  2. Security
    - No RLS changes needed (inherits from existing table policies)
  
  3. Changes
    - Adds transaction_hash column to payments table if it doesn't exist
    - Creates index for efficient lookups
    - Handles existing data gracefully
*/

-- Add transaction_hash column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'transaction_hash'
  ) THEN
    ALTER TABLE payments ADD COLUMN transaction_hash text;
    COMMENT ON COLUMN payments.transaction_hash IS 'Blockchain transaction hash for crypto payments';
  END IF;
END $$;

-- Create index for transaction_hash lookups if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'payments' AND indexname = 'idx_payments_transaction_hash'
  ) THEN
    CREATE INDEX idx_payments_transaction_hash ON payments(transaction_hash) WHERE transaction_hash IS NOT NULL;
  END IF;
END $$;

-- Verify the column was added
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'transaction_hash'
  ) THEN
    RAISE NOTICE 'SUCCESS: transaction_hash column exists in payments table';
  ELSE
    RAISE EXCEPTION 'FAILED: transaction_hash column was not created';
  END IF;
END $$;