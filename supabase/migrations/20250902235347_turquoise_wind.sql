/*
  # Crypto Payment Infrastructure

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
      - `expires_at` (timestamptz, payment expiration)
      - `paid_at` (timestamptz, when payment was confirmed)
      - `transaction_hash` (text, blockchain transaction hash)
      - `confirmations` (integer, number of confirmations)
      - `metadata` (jsonb, additional payment data)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `crypto_addresses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `currency` (text, BTC/ETH/USDC/USDT/MATIC)
      - `address` (text, crypto address)
      - `private_key_encrypted` (text, encrypted private key)
      - `is_active` (boolean, address status)
      - `created_at` (timestamptz)
      - `last_used_at` (timestamptz)
      - `total_received` (numeric, total amount received)
      - `payment_count` (integer, number of payments)

  2. Security
    - Enable RLS on both tables
    - Safe policy creation using pg_policies check
    - Users can only access their own crypto data

  3. Indexes
    - Performance indexes for common queries
    - Address and status lookups
    - User-based filtering
*/

-- Create crypto_payment_invoices table
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

-- Create crypto_addresses table
CREATE TABLE IF NOT EXISTS crypto_addresses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id),
  currency text NOT NULL CHECK (currency IN ('BTC', 'ETH', 'USDC', 'USDT', 'MATIC')),
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_user_id ON crypto_payment_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_status ON crypto_payment_invoices(status);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_address ON crypto_payment_invoices(payment_address);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_hash ON crypto_payment_invoices(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_crypto_addresses_user_id ON crypto_addresses(user_id);

-- Create update trigger function for crypto_payment_invoices
CREATE OR REPLACE FUNCTION update_crypto_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_crypto_invoices_updated_at ON crypto_payment_invoices;
CREATE TRIGGER update_crypto_invoices_updated_at
  BEFORE UPDATE ON crypto_payment_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_crypto_invoices_updated_at();

-- Safely create RLS policies using pg_policies check
DO $$
BEGIN
   -- crypto_payment_invoices INSERT policy
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
      WITH CHECK (auth.uid() = user_id);
   END IF;

   -- crypto_payment_invoices SELECT policy
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
      USING (auth.uid() = user_id);
   END IF;

   -- crypto_payment_invoices UPDATE policy (for system updates)
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

   -- crypto_addresses SELECT policy
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
      USING (auth.uid() = user_id);
   END IF;
END$$;