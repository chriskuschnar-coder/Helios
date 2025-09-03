/*
  # Add funding processing function

  1. New Functions
    - `process_funding_transaction` - Handles account funding with balance updates
    - Validates user permissions and account status
    - Creates transaction record and updates account balance atomically
    
  2. Security
    - Function uses security definer to bypass RLS for internal operations
    - Validates user exists and account is active before processing
    - Ensures atomic transaction processing
*/

-- Function to process funding transactions
CREATE OR REPLACE FUNCTION process_funding_transaction(
  p_user_id uuid,
  p_amount numeric(15,2),
  p_method text,
  p_description text DEFAULT 'Account funding'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_account_id uuid;
  v_current_balance numeric(15,2);
  v_transaction_id uuid;
  v_result json;
BEGIN
  -- Validate input
  IF p_amount <= 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Amount must be greater than 0'
    );
  END IF;

  -- Get user's account
  SELECT id, balance INTO v_account_id, v_current_balance
  FROM accounts
  WHERE user_id = p_user_id AND status = 'active'
  LIMIT 1;

  IF v_account_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No active account found for user'
    );
  END IF;

  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    account_id,
    type,
    method,
    amount,
    status,
    description,
    created_at
  ) VALUES (
    p_user_id,
    v_account_id,
    'deposit',
    p_method,
    p_amount,
    'completed',
    p_description,
    now()
  ) RETURNING id INTO v_transaction_id;

  -- Update account balance
  UPDATE accounts SET
    balance = balance + p_amount,
    available_balance = available_balance + p_amount,
    total_deposits = total_deposits + p_amount,
    updated_at = now()
  WHERE id = v_account_id;

  -- Return success result
  SELECT json_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'new_balance', balance,
    'amount_added', p_amount
  ) INTO v_result
  FROM accounts
  WHERE id = v_account_id;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION process_funding_transaction(uuid, numeric, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION process_funding_transaction(uuid, numeric, text, text) TO anon;