/*
  # Add transaction_hash column to payments table

  1. Schema Changes
    - Add `transaction_hash` column to `payments` table
    - Column type: text (nullable)
    - Uses IF NOT EXISTS to prevent conflicts

  2. Purpose
    - Stores blockchain transaction hashes for crypto payments
    - Enables tracking of on-chain payment confirmations
    - Supports payment verification and reconciliation

  3. Notes
    - Safe to run multiple times due to IF NOT EXISTS
    - Column is nullable to support non-crypto payment methods
    - No default value needed as it's populated by payment processors
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'transaction_hash'
  ) THEN
    ALTER TABLE payments ADD COLUMN transaction_hash text;
  END IF;
END $$;