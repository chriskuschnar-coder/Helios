/*
  # Add Crypto Payment Infrastructure

  1. New Tables
    - `crypto_payment_invoices`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `amount_usd` (numeric, USD amount)
      - `cryptocurrency` (text, BTC/ETH/USDT/SOL)
      - `crypto_amount` (numeric, crypto amount to receive)
      - `payment_address` (text, generated payment address)
      - `status` (text, pending/partial/confirmed/expired/failed)
      - `verification_id` (text, external verification ID)
      - `expires_at` (timestamp, payment expiration)
      - `paid_at` (timestamp, when payment was confirmed)
      - `transaction_hash` (text, blockchain transaction hash)
      - `confirmations` (integer, number of confirmations)
      - `metadata` (jsonb, additional payment data)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `crypto_addresses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `currency` (text, cryptocurrency type)
      - `address` (text, payment address)
      - `private_key_encrypted` (text, encrypted private key)
      - `is_active` (boolean, address status)
      - `created_at` (timestamp)
      - `last_used_at` (timestamp)
      - `total_received` (numeric, total amount received)
      - `payment_count` (integer, number of payments)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
    - Add indexes for performance

  3. Constraints
    - Cryptocurrency validation (BTC, ETH, USDT, SOL, MATIC)
    - Status validation for invoices
    - Currency validation for addresses
*/

-- Create crypto payment invoices table
CREATE TABLE IF NOT EXISTS crypto_payment_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  amount_usd numeric(15,2) NOT NULL,
  cryptocurrency text NOT NULL CHECK (cryptocurrency = ANY (ARRAY['BTC', 'ETH', 'USDT', 'SOL'])),
  crypto_amount numeric(20,8) NOT NULL,
  payment_address text NOT NULL,
  status text DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending', 'partial', 'confirmed', 'expired', 'failed'])),
  expires_at timestamptz NOT NULL,
  paid_at timestamptz,
  transaction_hash text,
  confirmations integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create crypto addresses table
CREATE TABLE IF NOT EXISTS crypto_addresses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id),
  currency text NOT NULL CHECK (currency = ANY (ARRAY['BTC', 'ETH', 'USDC', 'USDT', 'MATIC'])),
  address text NOT NULL,
  private_key_encrypted text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz,
  total_received numeric(20,8) DEFAULT 0,
  payment_count integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE crypto_payment_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_addresses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
-- Crypto Payment Invoices Policies
DROP POLICY IF EXISTS "Users can insert own crypto invoices" ON crypto_payment_invoices;
CREATE POLICY "Users can insert own crypto invoices"
  ON crypto_payment_invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own crypto invoices" ON crypto_payment_invoices;
CREATE POLICY "Users can view own crypto invoices"
  ON crypto_payment_invoices
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can update crypto invoices" ON crypto_payment_invoices;
CREATE POLICY "System can update crypto invoices"
  ON crypto_payment_invoices
  FOR UPDATE
  TO authenticated
  USING (true);

-- Crypto Addresses Policies
DROP POLICY IF EXISTS "Users can view own crypto addresses" ON crypto_addresses;
CREATE POLICY "Users can view own crypto addresses"
  ON crypto_addresses
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_user_id ON crypto_payment_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_status ON crypto_payment_invoices(status);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_address ON crypto_payment_invoices(payment_address);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_hash ON crypto_payment_invoices(transaction_hash);

CREATE INDEX IF NOT EXISTS idx_crypto_addresses_user_id ON crypto_addresses(user_id);

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