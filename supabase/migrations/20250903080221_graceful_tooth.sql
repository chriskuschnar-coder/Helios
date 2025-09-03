/*
  # Add transaction_hash column to payments table

  1. Schema Changes
    - Add `transaction_hash` column to `payments` table
    - Column will store blockchain transaction hashes for crypto payments
    - Optional field (nullable) since not all payments will have transaction hashes

  2. Purpose
    - Track blockchain transaction hashes for crypto payments
    - Enable verification of crypto payment confirmations
    - Support audit trail for crypto transactions
*/

-- Add transaction_hash column to payments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'transaction_hash'
  ) THEN
    ALTER TABLE payments ADD COLUMN transaction_hash text;
  END IF;
END $$;

-- Add index for transaction hash lookups
CREATE INDEX IF NOT EXISTS idx_payments_transaction_hash 
ON payments(transaction_hash) 
WHERE transaction_hash IS NOT NULL;