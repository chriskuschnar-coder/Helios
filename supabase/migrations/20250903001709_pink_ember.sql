/*
  # Comprehensive Crypto Payment System

  1. New Tables
    - `crypto_payment_invoices`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `amount_usd` (numeric, USD amount)
      - `cryptocurrency` (text, BTC/ETH/USDT/SOL)
      - `crypto_amount` (numeric, crypto amount to receive)
      - `payment_address` (text, generated payment address)
      - `status` (text, pending/partial/confirmed/expired/failed)
      - `expires_at` (timestamp, 24 hour expiry)
      - `paid_at` (timestamp, when payment confirmed)
      - `transaction_hash` (text, blockchain transaction)
      - `confirmations` (integer, network confirmations)
      - `metadata` (jsonb, additional data)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `crypto_payment_invoices` table
    - Add policies for users to manage their own invoices
    - Add policy for system to update invoice status

  3. Indexes
    - Performance indexes on user_id, status, payment_address, transaction_hash

  4. Triggers
    - Auto-update updated_at timestamp
*/

-- Create crypto_payment_invoices table
CREATE TABLE IF NOT EXISTS crypto_payment_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount_usd numeric(15,2) NOT NULL,
  cryptocurrency text NOT NULL CHECK (cryptocurrency = ANY (ARRAY['BTC'::text, 'ETH'::text, 'USDT'::text, 'SOL'::text])),
  crypto_amount numeric(20,8) NOT NULL,
  payment_address text NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'partial'::text, 'confirmed'::text, 'expired'::text, 'failed'::text])),
  expires_at timestamptz NOT NULL,
  paid_at timestamptz,
  transaction_hash text,
  confirmations integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Enable RLS
ALTER TABLE crypto_payment_invoices ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_user_id ON crypto_payment_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_status ON crypto_payment_invoices(status);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_address ON crypto_payment_invoices(payment_address);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_hash ON crypto_payment_invoices(transaction_hash);

-- OPTION 1: Use IF NOT EXISTS (PostgreSQL 9.5+)
CREATE POLICY IF NOT EXISTS "Users can insert own crypto invoices"
ON crypto_payment_invoices
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can view own crypto invoices"
ON crypto_payment_invoices
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "System can update crypto invoices"
ON crypto_payment_invoices
FOR UPDATE
USING (true);

-- OPTION 2: Conditional block approach (fallback for older PostgreSQL)
DO $$
BEGIN
   -- Check and create insert policy
   IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE policyname = 'Users can insert own crypto invoices backup' 
        AND tablename = 'crypto_payment_invoices'
   ) THEN
      CREATE POLICY "Users can insert own crypto invoices backup"
      ON crypto_payment_invoices
      FOR INSERT
      WITH CHECK (user_id = auth.uid());
   END IF;

   -- Check and create select policy
   IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE policyname = 'Users can view own crypto invoices backup' 
        AND tablename = 'crypto_payment_invoices'
   ) THEN
      CREATE POLICY "Users can view own crypto invoices backup"
      ON crypto_payment_invoices
      FOR SELECT
      USING (user_id = auth.uid());
   END IF;

   -- Check and create update policy
   IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE policyname = 'System can update crypto invoices backup' 
        AND tablename = 'crypto_payment_invoices'
   ) THEN
      CREATE POLICY "System can update crypto invoices backup"
      ON crypto_payment_invoices
      FOR UPDATE
      USING (true);
   END IF;
END$$;

-- Create trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_crypto_invoices_updated_at'
  ) THEN
    CREATE TRIGGER update_crypto_invoices_updated_at
      BEFORE UPDATE ON crypto_payment_invoices
      FOR EACH ROW
      EXECUTE FUNCTION update_crypto_invoices_updated_at();
  END IF;
END$$;