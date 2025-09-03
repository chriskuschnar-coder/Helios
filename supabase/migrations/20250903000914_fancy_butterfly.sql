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
      - `expires_at` (timestamptz, payment expiration)
      - `paid_at` (timestamptz, when payment confirmed)
      - `transaction_hash` (text, blockchain transaction hash)
      - `confirmations` (integer, blockchain confirmations)
      - `metadata` (jsonb, additional payment data)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `crypto_addresses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `currency` (text, BTC/ETH/USDC/USDT/MATIC)
      - `address` (text, wallet address)
      - `private_key_encrypted` (text, encrypted private key)
      - `is_active` (boolean, address status)
      - `created_at` (timestamptz)
      - `last_used_at` (timestamptz)
      - `total_received` (numeric, total received amount)
      - `payment_count` (integer, number of payments)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own crypto payments
    - Add policies for users to view their own crypto addresses

  3. Performance
    - Add indexes for efficient querying
    - Add update triggers for timestamp management

  4. Data Integrity
    - Add constraints for valid cryptocurrency types
    - Add constraints for valid payment statuses
    - Add foreign key relationships
*/

-- Create crypto_payment_invoices table
CREATE TABLE IF NOT EXISTS crypto_payment_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
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

-- Create crypto_addresses table
CREATE TABLE IF NOT EXISTS crypto_addresses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  currency text NOT NULL,
  address text NOT NULL,
  private_key_encrypted text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz,
  total_received numeric(20,8) DEFAULT 0,
  payment_count integer DEFAULT 0
);

-- Add constraints for crypto_payment_invoices
ALTER TABLE crypto_payment_invoices 
ADD CONSTRAINT IF NOT EXISTS crypto_payment_invoices_cryptocurrency_check 
CHECK (cryptocurrency = ANY (ARRAY['BTC'::text, 'ETH'::text, 'USDT'::text, 'SOL'::text]));

ALTER TABLE crypto_payment_invoices 
ADD CONSTRAINT IF NOT EXISTS crypto_payment_invoices_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'partial'::text, 'confirmed'::text, 'expired'::text, 'failed'::text]));

-- Add constraints for crypto_addresses
ALTER TABLE crypto_addresses 
ADD CONSTRAINT IF NOT EXISTS crypto_addresses_currency_check 
CHECK (currency = ANY (ARRAY['BTC'::text, 'ETH'::text, 'USDC'::text, 'USDT'::text, 'MATIC'::text]));

-- Add foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'crypto_payment_invoices_user_id_fkey'
  ) THEN
    ALTER TABLE crypto_payment_invoices 
    ADD CONSTRAINT crypto_payment_invoices_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'crypto_addresses_user_id_fkey'
  ) THEN
    ALTER TABLE crypto_addresses 
    ADD CONSTRAINT crypto_addresses_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE crypto_payment_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_addresses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent approach)
DROP POLICY IF EXISTS "Users can insert own crypto invoices" ON crypto_payment_invoices;
DROP POLICY IF EXISTS "Users can view own crypto invoices" ON crypto_payment_invoices;
DROP POLICY IF EXISTS "System can update crypto invoices" ON crypto_payment_invoices;
DROP POLICY IF EXISTS "Users can view own crypto addresses" ON crypto_addresses;

-- Create RLS policies for crypto_payment_invoices
CREATE POLICY "Users can insert own crypto invoices"
ON crypto_payment_invoices
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own crypto invoices"
ON crypto_payment_invoices
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can update crypto invoices"
ON crypto_payment_invoices
FOR UPDATE
USING (true);

-- Create RLS policies for crypto_addresses
CREATE POLICY "Users can view own crypto addresses"
ON crypto_addresses
FOR SELECT
USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_user_id ON crypto_payment_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_status ON crypto_payment_invoices(status);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_address ON crypto_payment_invoices(payment_address);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_hash ON crypto_payment_invoices(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_crypto_addresses_user_id ON crypto_addresses(user_id);

-- Create update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_crypto_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update trigger
DROP TRIGGER IF EXISTS update_crypto_invoices_updated_at ON crypto_payment_invoices;
CREATE TRIGGER update_crypto_invoices_updated_at
  BEFORE UPDATE ON crypto_payment_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_crypto_invoices_updated_at();