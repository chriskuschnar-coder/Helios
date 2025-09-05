/*
  # Create Payments Table

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `product_id` (text, default 'account_funding')
      - `quantity` (integer, default 1)
      - `total_amount` (numeric)
      - `status` (text, default 'pending')
      - `stripe_session_id` (text, optional)
      - `stripe_payment_intent_id` (text, optional)
      - `is_paid` (boolean, default false)
      - `metadata` (jsonb, default {})
      - `transaction_hash` (text, optional for crypto)
      - `created_at` (timestamp, default now)
      - `updated_at` (timestamp, default now)

  2. Security
    - Enable RLS on `payments` table
    - Add policies for users to access their own payments
*/

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  product_id text DEFAULT 'account_funding',
  quantity integer DEFAULT 1,
  total_amount numeric(15,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  stripe_session_id text,
  stripe_payment_intent_id text,
  is_paid boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  transaction_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update payments"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);

-- Create updated_at trigger function for payments
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();