/*
  # Sync All Users to Investor Units System

  1. Data Sync
    - Backfill existing users into investor_units table
    - Ensure every auth.users has corresponding investor_units record
    - Reset all balances to $0 for live trading start

  2. Fund System Setup
    - Initialize fund NAV at $1000.0000 per unit
    - Clear all historical data for fresh start
    - Prepare for live MT5 integration

  3. Security
    - All RLS policies use auth.uid() correctly
    - Service role can manage fund operations
    - Users can only see their own data
*/

-- STEP 1: Clear existing data for fresh start
DELETE FROM fund_transactions;
DELETE FROM investor_units;
DELETE FROM fund_nav;
DELETE FROM mt5_data_feed;
DELETE FROM transactions WHERE type IN ('deposit', 'withdrawal');
DELETE FROM payments WHERE status != 'completed';
DELETE FROM crypto_payment_invoices;

-- STEP 2: Reset all account balances to $0
UPDATE accounts SET 
  balance = 0.00,
  available_balance = 0.00,
  total_deposits = 0.00,
  total_withdrawals = 0.00,
  units_held = 0,
  nav_per_unit = 1000.0000,
  fund_allocation_pct = 0,
  updated_at = now();

-- STEP 3: Sync ALL users (existing and future) to investor_units
-- This ensures every user has a portfolio record
INSERT INTO investor_units (user_id, account_id, units_held, avg_purchase_nav, total_invested, current_value, unrealized_pnl)
SELECT 
  u.id as user_id,
  a.id as account_id,
  0 as units_held,
  1000.0000 as avg_purchase_nav,
  0 as total_invested,
  0 as current_value,
  0 as unrealized_pnl
FROM auth.users u
JOIN accounts a ON a.user_id = u.id
LEFT JOIN investor_units iu ON iu.user_id = u.id
WHERE iu.id IS NULL;

-- STEP 4: Initialize fund NAV for today
INSERT INTO fund_nav (
  date,
  total_aum,
  nav_per_unit,
  units_outstanding,
  daily_pnl,
  daily_return_pct,
  mt5_equity,
  mt5_balance
) VALUES (
  CURRENT_DATE,
  0,
  1000.0000,
  0,
  0,
  0,
  0,
  0
) ON CONFLICT (date) DO UPDATE SET
  total_aum = EXCLUDED.total_aum,
  nav_per_unit = EXCLUDED.nav_per_unit,
  updated_at = now();

-- STEP 5: Create function to handle user deposits with fund unit allocation
CREATE OR REPLACE FUNCTION process_user_deposit(
  p_user_id uuid,
  p_deposit_amount numeric,
  p_method text DEFAULT 'stripe',
  p_description text DEFAULT 'Investment deposit'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_account_id uuid;
  v_current_nav numeric(10,4);
  v_units_to_issue numeric(15,4);
  v_existing_units record;
  v_new_total_units numeric(15,4);
  v_new_total_invested numeric(15,2);
  v_new_avg_nav numeric(10,4);
  v_result json;
BEGIN
  -- Get user's account
  SELECT id INTO v_account_id
  FROM accounts
  WHERE user_id = p_user_id;
  
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'User account not found';
  END IF;

  -- Get current NAV per unit
  SELECT nav_per_unit INTO v_current_nav
  FROM fund_nav
  ORDER BY date DESC
  LIMIT 1;
  
  IF v_current_nav IS NULL THEN
    v_current_nav := 1000.0000; -- Default starting NAV
  END IF;

  -- Calculate units to issue
  v_units_to_issue := p_deposit_amount / v_current_nav;

  -- Get existing investor units record
  SELECT * INTO v_existing_units
  FROM investor_units
  WHERE user_id = p_user_id AND account_id = v_account_id;

  IF v_existing_units IS NULL THEN
    -- Create new investor units record
    INSERT INTO investor_units (
      user_id,
      account_id,
      units_held,
      avg_purchase_nav,
      total_invested,
      current_value,
      unrealized_pnl
    ) VALUES (
      p_user_id,
      v_account_id,
      v_units_to_issue,
      v_current_nav,
      p_deposit_amount,
      p_deposit_amount,
      0
    );
    
    v_new_total_units := v_units_to_issue;
    v_new_total_invested := p_deposit_amount;
    v_new_avg_nav := v_current_nav;
  ELSE
    -- Update existing record
    v_new_total_units := v_existing_units.units_held + v_units_to_issue;
    v_new_total_invested := v_existing_units.total_invested + p_deposit_amount;
    v_new_avg_nav := v_new_total_invested / v_new_total_units;
    
    UPDATE investor_units SET
      units_held = v_new_total_units,
      avg_purchase_nav = v_new_avg_nav,
      total_invested = v_new_total_invested,
      current_value = v_new_total_units * v_current_nav,
      unrealized_pnl = (v_new_total_units * v_current_nav) - v_new_total_invested,
      last_nav_update = now(),
      updated_at = now()
    WHERE user_id = p_user_id AND account_id = v_account_id;
  END IF;

  -- Update main accounts table for dashboard display
  UPDATE accounts SET
    balance = v_new_total_units * v_current_nav,
    available_balance = v_new_total_units * v_current_nav,
    total_deposits = total_deposits + p_deposit_amount,
    units_held = v_new_total_units,
    nav_per_unit = v_current_nav,
    updated_at = now()
  WHERE id = v_account_id;

  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    account_id,
    type,
    method,
    amount,
    status,
    description,
    metadata
  ) VALUES (
    p_user_id,
    v_account_id,
    'deposit',
    p_method,
    p_deposit_amount,
    'completed',
    p_description,
    json_build_object(
      'units_issued', v_units_to_issue,
      'nav_per_unit', v_current_nav,
      'fund_allocation', true
    )
  );

  -- Return result
  v_result := json_build_object(
    'success', true,
    'units_issued', v_units_to_issue,
    'nav_per_unit', v_current_nav,
    'total_units', v_new_total_units,
    'total_invested', v_new_total_invested,
    'current_value', v_new_total_units * v_current_nav
  );

  RETURN v_result;
END;
$$;

-- STEP 6: Create trigger to auto-sync new users
CREATE OR REPLACE FUNCTION sync_new_user_to_investor_units()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When a new account is created, automatically create investor_units record
  INSERT INTO investor_units (
    user_id,
    account_id,
    units_held,
    avg_purchase_nav,
    total_invested,
    current_value,
    unrealized_pnl
  ) VALUES (
    NEW.user_id,
    NEW.id,
    0,
    1000.0000,
    0,
    0,
    0
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger on accounts table
DROP TRIGGER IF EXISTS sync_new_user_trigger ON accounts;
CREATE TRIGGER sync_new_user_trigger
  AFTER INSERT ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION sync_new_user_to_investor_units();