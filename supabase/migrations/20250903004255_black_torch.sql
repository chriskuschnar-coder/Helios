/*
  # Add crypto payment invoices table with constraints and policies

  1. New Tables
    - `crypto_payment_invoices`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `amount_usd` (numeric, investment amount in USD)
      - `cryptocurrency` (text, BTC/ETH/USDT/SOL)
      - `crypto_amount` (numeric, amount in crypto)
      - `payment_address` (text, blockchain address)
      - `status` (text, payment status)
      - `expires_at` (timestamptz, payment expiration)
      - `paid_at` (timestamptz, payment completion)
      - `transaction_hash` (text, blockchain transaction)
      - `confirmations` (integer, blockchain confirmations)
      - `metadata` (jsonb, additional data)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `crypto_payment_invoices` table
    - Add INSERT policy for users to create own invoices
    - Add SELECT policy for users to view own invoices
    - Add UPDATE policy for system to update payment status

  3. Constraints
    - Cryptocurrency must be BTC, ETH, USDT, or SOL
    - Status must be pending, partial, confirmed, expired, or failed

  4. Indexes
    - User ID for fast user queries
    - Payment address for blockchain lookups
    - Transaction hash for confirmation tracking
    - Status for payment monitoring
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_user_id ON crypto_payment_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_address ON crypto_payment_invoices(payment_address);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_hash ON crypto_payment_invoices(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_status ON crypto_payment_invoices(status);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_crypto_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_crypto_invoices_updated_at ON crypto_payment_invoices;

CREATE TRIGGER update_crypto_invoices_updated_at
  BEFORE UPDATE ON crypto_payment_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_crypto_invoices_updated_at();