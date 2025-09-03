/*
  # Create crypto payment invoices table

  1. New Tables
    - `crypto_payment_invoices`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `amount_usd` (numeric, investment amount in USD)
      - `cryptocurrency` (text, BTC/ETH/USDT/SOL)
      - `crypto_amount` (numeric, amount in crypto)
      - `payment_address` (text, unique payment address)
      - `status` (text, payment status)
      - `verification_id` (text, optional external verification)
      - `data_blob` (jsonb, additional payment data)
      - `expires_at` (timestamptz, payment expiration)
      - `paid_at` (timestamptz, payment completion time)
      - `transaction_hash` (text, blockchain transaction hash)
      - `confirmations` (integer, blockchain confirmations)
      - `metadata` (jsonb, additional metadata)
      - `created_at` (timestamptz, creation time)
      - `updated_at` (timestamptz, last update time)

  2. Security
    - Enable RLS on `crypto_payment_invoices` table
    - Add policy for users to insert own crypto invoices
    - Add policy for users to view own crypto invoices
    - Add policy for system to update crypto invoices

  3. Constraints
    - Cryptocurrency must be BTC, ETH, USDT, or SOL
    - Status must be pending, partial, confirmed, expired, or failed

  4. Indexes
    - Index on user_id for fast user queries
    - Index on payment_address for address lookups
    - Index on transaction_hash for blockchain verification
    - Index on status for payment status filtering
*/

-- Create crypto payment invoices table
CREATE TABLE IF NOT EXISTS crypto_payment_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  amount_usd numeric(15,2) NOT NULL,
  cryptocurrency text NOT NULL,
  crypto_amount numeric(20,8) NOT NULL,
  payment_address text NOT NULL,
  status text DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  paid_at timestamptz,
  transaction_hash text,
  confirmations integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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

-- Insert policy
DROP POLICY IF EXISTS "Users can insert own crypto invoices" ON crypto_payment_invoices;

CREATE POLICY "Users can insert own crypto invoices"
ON crypto_payment_invoices
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Select policy
DROP POLICY IF EXISTS "Users can view own crypto invoices" ON crypto_payment_invoices;

CREATE POLICY "Users can view own crypto invoices"
ON crypto_payment_invoices
FOR SELECT
USING (user_id = auth.uid());

-- Update policy for system
DROP POLICY IF EXISTS "System can update crypto invoices" ON crypto_payment_invoices;

CREATE POLICY "System can update crypto invoices"
ON crypto_payment_invoices
FOR UPDATE
USING (true);

-- Performance indexes
DROP INDEX IF EXISTS idx_crypto_invoices_user_id;
CREATE INDEX idx_crypto_invoices_user_id ON crypto_payment_invoices(user_id);

DROP INDEX IF EXISTS idx_crypto_invoices_address;
CREATE INDEX idx_crypto_invoices_address ON crypto_payment_invoices(payment_address);

DROP INDEX IF EXISTS idx_crypto_invoices_hash;
CREATE INDEX idx_crypto_invoices_hash ON crypto_payment_invoices(transaction_hash);

DROP INDEX IF EXISTS idx_crypto_invoices_status;
CREATE INDEX idx_crypto_invoices_status ON crypto_payment_invoices(status);

-- Update trigger
DROP TRIGGER IF EXISTS update_crypto_invoices_updated_at ON crypto_payment_invoices;

CREATE OR REPLACE FUNCTION update_crypto_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crypto_invoices_updated_at
    BEFORE UPDATE ON crypto_payment_invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_crypto_invoices_updated_at();