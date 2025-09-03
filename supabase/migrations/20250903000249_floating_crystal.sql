/*
  # Add Crypto Payment Tables

  1. New Tables
    - `crypto_payment_invoices`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `amount_usd` (numeric, investment amount in USD)
      - `cryptocurrency` (text, BTC/ETH/USDT/SOL)
      - `crypto_amount` (numeric, amount in crypto)
      - `payment_address` (text, generated payment address)
      - `status` (text, pending/partial/confirmed/expired/failed)
      - `expires_at` (timestamp, 24-hour expiry)
      - `paid_at` (timestamp, when payment confirmed)
      - `transaction_hash` (text, blockchain transaction hash)
      - `confirmations` (integer, blockchain confirmations)
      - `metadata` (jsonb, additional payment data)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `crypto_addresses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `currency` (text, BTC/ETH/USDC/USDT/MATIC)
      - `address` (text, crypto wallet address)
      - `private_key_encrypted` (text, encrypted private key)
      - `is_active` (boolean, address status)
      - `created_at` (timestamp)
      - `last_used_at` (timestamp)
      - `total_received` (numeric, total crypto received)
      - `payment_count` (integer, number of payments)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own crypto data
    - Add indexes for performance

  3. Constraints
    - Cryptocurrency validation (BTC, ETH, USDT, SOL)
    - Status validation for payment tracking
    - Currency validation for addresses
*/

-- Create crypto_payment_invoices table
CREATE TABLE IF NOT EXISTS crypto_payment_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  amount_usd numeric(15,2) NOT NULL,
  cryptocurrency text NOT NULL CHECK (cryptocurrency = ANY (ARRAY['BTC'::text, 'ETH'::text, 'USDT'::text, 'SOL'::text])),
  crypto_amount numeric(20,8) NOT NULL,
  payment_address text NOT NULL,
  status text DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending'::text, 'partial'::text, 'confirmed'::text, 'expired'::text, 'failed'::text])),
  expires_at timestamptz NOT NULL,
  paid_at timestamptz,
  transaction_hash text,
  confirmations integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create crypto_addresses table
CREATE TABLE IF NOT EXISTS crypto_addresses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id),
  currency text NOT NULL CHECK (currency = ANY (ARRAY['BTC'::text, 'ETH'::text, 'USDC'::text, 'USDT'::text, 'MATIC'::text])),
  address text NOT NULL,
  private_key_encrypted text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz,
  total_received numeric(20,8) DEFAULT 0,
  payment_count integer DEFAULT 0
);

-- Enable RLS on crypto_payment_invoices
ALTER TABLE crypto_payment_invoices ENABLE ROW LEVEL SECURITY;

-- Enable RLS on crypto_addresses
ALTER TABLE crypto_addresses ENABLE ROW LEVEL SECURITY;

-- Create indexes for crypto_payment_invoices
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_user_id ON crypto_payment_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_status ON crypto_payment_invoices(status);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_address ON crypto_payment_invoices(payment_address);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_hash ON crypto_payment_invoices(transaction_hash);

-- Create indexes for crypto_addresses
CREATE INDEX IF NOT EXISTS idx_crypto_addresses_user_id ON crypto_addresses(user_id);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_crypto_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for crypto_payment_invoices
DROP TRIGGER IF EXISTS update_crypto_invoices_updated_at ON crypto_payment_invoices;
CREATE TRIGGER update_crypto_invoices_updated_at
  BEFORE UPDATE ON crypto_payment_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_crypto_invoices_updated_at();

-- Safely create RLS policies using conditional blocks to prevent duplicate creation errors

-- Policy for crypto_payment_invoices SELECT
DO $$
BEGIN
   IF NOT EXISTS (
      SELECT 1 
      FROM pg_policies 
      WHERE policyname = 'Users can view own crypto invoices' 
        AND tablename = 'crypto_payment_invoices'
   ) THEN
      CREATE POLICY "Users can view own crypto invoices"
      ON crypto_payment_invoices
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
   END IF;
END$$;

-- Policy for crypto_payment_invoices INSERT
DO $$
BEGIN
   IF NOT EXISTS (
      SELECT 1 
      FROM pg_policies 
      WHERE policyname = 'Users can insert own crypto invoices' 
        AND tablename = 'crypto_payment_invoices'
   ) THEN
      CREATE POLICY "Users can insert own crypto invoices"
      ON crypto_payment_invoices
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
   END IF;
END$$;

-- Policy for crypto_payment_invoices UPDATE (system can update)
DO $$
BEGIN
   IF NOT EXISTS (
      SELECT 1 
      FROM pg_policies 
      WHERE policyname = 'System can update crypto invoices' 
        AND tablename = 'crypto_payment_invoices'
   ) THEN
      CREATE POLICY "System can update crypto invoices"
      ON crypto_payment_invoices
      FOR UPDATE
      TO authenticated
      USING (true);
   END IF;
END$$;

-- Policy for crypto_addresses SELECT
DO $$
BEGIN
   IF NOT EXISTS (
      SELECT 1 
      FROM pg_policies 
      WHERE policyname = 'Users can view own crypto addresses' 
        AND tablename = 'crypto_addresses'
   ) THEN
      CREATE POLICY "Users can view own crypto addresses"
      ON crypto_addresses
      FOR SELECT
      TO public
      USING (user_id = auth.uid());
   END IF;
END$$;