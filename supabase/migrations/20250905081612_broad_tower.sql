/*
  # Complete System Reset and Live Trading Preparation

  1. Reset All Accounts
    - Set all balances to $0
    - Clear all transaction history
    - Reset fund metrics to starting values

  2. Sync All Users to Investor Units
    - Backfill existing users with investor_units records
    - Ensure every user can see fund performance
    - Prepare for live MT5 integration

  3. Security
    - Update RLS policies with correct auth.uid() syntax
    - Ensure proper access controls for fund data

  4. Live Trading Ready
    - Clean slate for MT5 bot integration
    - Real fund unit allocation system
    - Live NAV updates from trading performance
*/

-- STEP 1: Reset all account balances to $0
UPDATE accounts SET 
  balance = 0.00,
  available_balance = 0.00,
  total_deposits = 0.00,
  total_withdrawals = 0.00,
  units_held = 0,
  nav_per_unit = 1000.0000,
  updated_at = now();

-- STEP 2: Clear all transaction history (fresh start)
DELETE FROM transactions;
DELETE FROM fund_transactions;
DELETE FROM payments;
DELETE FROM crypto_payment_invoices;

-- STEP 3: Clear all fund data (reset for live trading)
DELETE FROM fund_nav;
DELETE FROM mt5_data_feed;
DELETE FROM investor_units;

-- STEP 4: Backfill investor_units for ALL existing users
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
WHERE NOT EXISTS (
  SELECT 1 FROM investor_units iu WHERE iu.user_id = u.id
);

-- STEP 5: Create function to process user deposits with fund unit allocation
CREATE OR REPLACE FUNCTION process_user_deposit(
  p_user_id uuid,
  p_deposit_amount numeric,
  p_method text,
  p_description text DEFAULT 'Deposit'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_account_id uuid;
  v_current_nav numeric(10,4);
  v_units_to_issue numeric(15,4);
  v_existing_units numeric(15,4);
  v_existing_invested numeric(15,2);
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

  -- Get current NAV per unit (default to 1000.0000 if no NAV exists)
  SELECT nav_per_unit INTO v_current_nav
  FROM fund_nav
  ORDER BY date DESC
  LIMIT 1;
  
  IF v_current_nav IS NULL THEN
    v_current_nav := 1000.0000;
  END IF;

  -- Calculate units to issue
  v_units_to_issue := p_deposit_amount / v_current_nav;

  -- Get existing investor position
  SELECT units_held, total_invested
  INTO v_existing_units, v_existing_invested
  FROM investor_units
  WHERE user_id = p_user_id;

  -- Calculate new totals
  v_new_total_units := COALESCE(v_existing_units, 0) + v_units_to_issue;
  v_new_total_invested := COALESCE(v_existing_invested, 0) + p_deposit_amount;
  v_new_avg_nav := v_new_total_invested / v_new_total_units;

  -- Update investor_units (upsert)
  INSERT INTO investor_units (
    user_id, account_id, units_held, avg_purchase_nav, 
    total_invested, current_value, unrealized_pnl
  )
  VALUES (
    p_user_id, v_account_id, v_new_total_units, v_new_avg_nav,
    v_new_total_invested, v_new_total_invested, 0
  )
  ON CONFLICT (user_id, account_id)
  DO UPDATE SET
    units_held = v_new_total_units,
    avg_purchase_nav = v_new_avg_nav,
    total_invested = v_new_total_invested,
    current_value = v_new_total_invested,
    unrealized_pnl = 0,
    updated_at = now();

  -- Update main accounts table for dashboard display
  UPDATE accounts SET
    balance = v_new_total_invested,
    available_balance = v_new_total_invested,
    total_deposits = total_deposits + p_deposit_amount,
    units_held = v_new_total_units,
    nav_per_unit = v_current_nav,
    updated_at = now()
  WHERE id = v_account_id;

  -- Create transaction record
  INSERT INTO transactions (
    user_id, account_id, type, method, amount, status, description
  )
  VALUES (
    p_user_id, v_account_id, 'deposit', p_method, p_deposit_amount, 'completed', p_description
  );

  -- Return success with details
  v_result := json_build_object(
    'success', true,
    'units_issued', v_units_to_issue,
    'nav_per_unit', v_current_nav,
    'total_units', v_new_total_units,
    'total_invested', v_new_total_invested,
    'new_balance', v_new_total_invested
  );

  RETURN v_result;
END;
$$;

-- STEP 6: Create trigger to auto-create investor_units for new accounts
CREATE OR REPLACE FUNCTION create_investor_units_for_new_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create investor_units record for new account
  INSERT INTO investor_units (
    user_id, account_id, units_held, avg_purchase_nav, 
    total_invested, current_value, unrealized_pnl
  )
  VALUES (
    NEW.user_id, NEW.id, 0, 1000.0000, 0, 0, 0
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger on accounts table
DROP TRIGGER IF EXISTS create_investor_units_trigger ON accounts;
CREATE TRIGGER create_investor_units_trigger
  AFTER INSERT ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION create_investor_units_for_new_account();

-- STEP 7: Update RLS policies with correct auth.uid() syntax
DROP POLICY IF EXISTS "Users can read own unit holdings" ON investor_units;
CREATE POLICY "Users can read own unit holdings"
  ON investor_units
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can read fund NAV data" ON fund_nav;
CREATE POLICY "Users can read fund NAV data"
  ON fund_nav
  FOR SELECT
  TO authenticated
  USING (true);

-- STEP 8: Enable Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE fund_nav;
ALTER PUBLICATION supabase_realtime ADD TABLE investor_units;
ALTER PUBLICATION supabase_realtime ADD TABLE accounts;

-- STEP 9: Create initial fund NAV record
INSERT INTO fund_nav (
  date, total_aum, nav_per_unit, units_outstanding, 
  daily_pnl, daily_return_pct, mt5_equity, mt5_balance
)
VALUES (
  CURRENT_DATE, 0, 1000.0000, 0, 0, 0, 0, 0
)
ON CONFLICT (date) DO NOTHING;