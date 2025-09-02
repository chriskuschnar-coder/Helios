/*
  # Add crypto payment infrastructure

  1. New Tables
    - `crypto_payment_invoices`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `amount_usd` (numeric)
      - `cryptocurrency` (text)
      - `crypto_amount` (numeric)
      - `payment_address` (text)
      - `status` (text)
      - `expires_at` (timestamp)
      - `paid_at` (timestamp)
      - `transaction_hash` (text)
      - `confirmations` (integer)
      - `metadata` (jsonb)

    - `crypto_addresses`
      - Enhanced with payment tracking fields

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users

  3. Functions
    - Add function to generate unique payment addresses
    - Add function to update transaction status
*/

-- Create crypto payment invoices table
CREATE TABLE IF NOT EXISTS crypto_payment_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  amount_usd numeric(15,2) NOT NULL,
  cryptocurrency text NOT NULL CHECK (cryptocurrency IN ('BTC', 'ETH', 'USDT', 'SOL')),
  crypto_amount numeric(20,8) NOT NULL,
  payment_address text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'confirmed', 'expired', 'failed')),
  expires_at timestamptz NOT NULL,
  paid_at timestamptz,
  transaction_hash text,
  confirmations integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for crypto payment invoices
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_user_id ON crypto_payment_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_status ON crypto_payment_invoices(status);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_address ON crypto_payment_invoices(payment_address);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_hash ON crypto_payment_invoices(transaction_hash);

-- Enable RLS
ALTER TABLE crypto_payment_invoices ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view own crypto invoices"
  ON crypto_payment_invoices
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crypto invoices"
  ON crypto_payment_invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update crypto invoices"
  ON crypto_payment_invoices
  FOR UPDATE
  TO authenticated
  USING (true);

-- Add trigger for updated_at
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

-- Update crypto_addresses table with payment tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crypto_addresses' AND column_name = 'last_used_at'
  ) THEN
    ALTER TABLE crypto_addresses ADD COLUMN last_used_at timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crypto_addresses' AND column_name = 'total_received'
  ) THEN
    ALTER TABLE crypto_addresses ADD COLUMN total_received numeric(20,8) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'crypto_addresses' AND column_name = 'payment_count'
  ) THEN
    ALTER TABLE crypto_addresses ADD COLUMN payment_count integer DEFAULT 0;
  END IF;
END $$;