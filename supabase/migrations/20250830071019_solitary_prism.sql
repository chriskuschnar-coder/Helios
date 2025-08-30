/*
  # User Account System Setup

  1. New Tables
    - Updates to existing `accounts` table to ensure proper user isolation
    - Updates to existing `transactions` table for user-specific transactions
    - New policies for user data isolation

  2. Security
    - Enhanced RLS policies for complete user data isolation
    - Policies for account creation and management
    - Transaction policies for user-specific data

  3. Functions
    - Trigger function to automatically create account for new users
    - Function to handle initial account setup
*/

-- Create function to automatically create account for new users
CREATE OR REPLACE FUNCTION create_user_account()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a default trading account for the new user
  INSERT INTO public.accounts (
    user_id,
    account_type,
    balance,
    available_balance,
    total_deposits,
    total_withdrawals,
    currency,
    status
  ) VALUES (
    NEW.id,
    'trading',
    0.00,
    0.00,
    0.00,
    0.00,
    'USD',
    'active'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create account when user signs up
DROP TRIGGER IF EXISTS create_account_for_new_user ON auth.users;
CREATE TRIGGER create_account_for_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_account();

-- Enhanced RLS policies for accounts
DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;

CREATE POLICY "Users can view own accounts"
  ON accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enhanced RLS policies for transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;

CREATE POLICY "Users can view own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to handle funding transactions
CREATE OR REPLACE FUNCTION process_funding_transaction(
  p_user_id uuid,
  p_amount numeric,
  p_method text,
  p_description text DEFAULT 'Account funding'
)
RETURNS json AS $$
DECLARE
  v_account_id uuid;
  v_transaction_id uuid;
BEGIN
  -- Get user's account
  SELECT id INTO v_account_id
  FROM accounts
  WHERE user_id = p_user_id AND account_type = 'trading'
  LIMIT 1;

  IF v_account_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Account not found');
  END IF;

  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    account_id,
    type,
    method,
    amount,
    status,
    description
  ) VALUES (
    p_user_id,
    v_account_id,
    'deposit',
    p_method,
    p_amount,
    'completed',
    p_description
  ) RETURNING id INTO v_transaction_id;

  -- Update account balance
  UPDATE accounts
  SET 
    balance = balance + p_amount,
    available_balance = available_balance + p_amount,
    total_deposits = total_deposits + p_amount,
    updated_at = now()
  WHERE id = v_account_id;

  RETURN json_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'new_balance', (SELECT balance FROM accounts WHERE id = v_account_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION process_funding_transaction TO authenticated;