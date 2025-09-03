/*
  # Create payments table for Stripe integration

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `product_id` (text, for tracking what was purchased)
      - `quantity` (integer, amount of product)
      - `total_amount` (decimal, payment amount)
      - `status` (text, payment status)
      - `stripe_session_id` (text, Stripe checkout session ID)
      - `stripe_payment_intent_id` (text, Stripe payment intent ID)
      - `is_paid` (boolean, payment completion status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `payments` table
    - Add policy for users to view their own payments
    - Add policy for users to insert their own payments

  3. Indexes
    - Index on user_id for fast user payment lookups
    - Index on stripe_payment_intent_id for webhook processing
*/

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  product_id text DEFAULT 'account_funding',
  quantity integer DEFAULT 1,
  total_amount decimal(15,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  stripe_session_id text,
  stripe_payment_intent_id text,
  is_paid boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Update trigger
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();