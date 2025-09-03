/*
  # Add constraints to crypto_payment_invoices table

  1. Security
    - Enable RLS on crypto_payment_invoices table
    - Add INSERT policy for users to create own crypto invoices
    - Add SELECT policy for users to view own crypto invoices

  2. Constraints
    - Add cryptocurrency constraint (BTC, ETH, USDT, SOL)
    - Add status constraint (pending, partial, confirmed, expired, failed)

  This migration uses DROP CONSTRAINT IF EXISTS followed by ADD CONSTRAINT
  for maximum reliability and idempotency.
*/

-- Enable RLS
ALTER TABLE crypto_payment_invoices ENABLE ROW LEVEL SECURITY;

-- Crypto type constraint
ALTER TABLE crypto_payment_invoices
DROP CONSTRAINT IF EXISTS crypto_payment_invoices_cryptocurrency_check;

ALTER TABLE crypto_payment_invoices
ADD CONSTRAINT crypto_payment_invoices_cryptocurrency_check
CHECK (cryptocurrency IN ('BTC','ETH','USDT','SOL'));

-- Status constraint
ALTER TABLE crypto_payment_invoices
DROP CONSTRAINT IF EXISTS crypto_payment_invoices_status_check;

ALTER TABLE crypto_payment_invoices
ADD CONSTRAINT crypto_payment_invoices_status_check
CHECK (status IN ('pending','partial','confirmed','expired','failed'));

-- RLS Policies
CREATE POLICY "Users can insert own crypto invoices"
  ON crypto_payment_invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own crypto invoices"
  ON crypto_payment_invoices
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);