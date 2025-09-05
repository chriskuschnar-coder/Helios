/*
  # Complete User Sync and Fund System Setup

  1. Reset System
     - Clear all existing balances and units
     - Reset fund NAV to starting position
     - Prepare for live MT5 integration

  2. User Synchronization  
     - Backfill all existing users into investor_units
     - Auto-sync new users via trigger
     - Ensure every user has portfolio tracking

  3. Fund Unit System
     - NAV-based unit allocation
     - Real-time portfolio updates
     - MT5 trading integration ready

  4. Security
     - RLS policies with auth.uid()
     - Proper user isolation
     - Service role access for MT5 bot
*/

-- STEP 1: Reset all accounts to $0 for live trading start
UPDATE accounts SET 
  balance = 0,
  available_balance = 0,
  total_deposits = 0,
  total_withdrawals = 0,
  units_held = 0,
  nav_per_unit = 1000.0000,
  updated_at = now();

-- STEP 2: Clear existing investor_units for fresh start
DELETE FROM investor_units;

-- STEP 3: Clear transaction history for clean slate
DELETE FROM transactions;
DELETE FROM fund_transactions;
DELETE FROM payments;

-- STEP 4: Reset fund NAV to starting position
DELETE FROM fund_nav;
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
);

-- STEP 5: Clear MT5 data feed for fresh start
DELETE FROM mt5_data_feed;

-- STEP 6: Backfill ALL existing users into investor_units
INSERT INTO investor_units (user_id, account_id, units_held, avg_purchase_nav, total_invested, current_value, unrealized_pnl)
SELECT 
  u.id,
  a.id,
  0,
  1000.0000,
  0,
  0,
  0
FROM auth.users u
JOIN accounts a ON a.user_id = u.id
LEFT JOIN investor_units iu ON iu.user_id = u.id
WHERE iu.id IS NULL;

-- STEP 7: Create trigger to auto-sync new users
CREATE OR REPLACE FUNCTION create_investor_units_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
$$ LANGUAGE plpgsql;

-- Apply trigger to accounts table
DROP TRIGGER IF EXISTS create_investor_units_trigger ON accounts;
CREATE TRIGGER create_investor_units_trigger
  AFTER INSERT ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION create_investor_units_for_new_user();

-- STEP 8: Create fund deposit processing function
CREATE OR REPLACE FUNCTION process_user_deposit(
  p_user_id uuid,
  p_deposit_amount numeric,
  p_method text DEFAULT 'stripe',
  p_description text DEFAULT 'Fund deposit'
)
RETURNS json AS $$
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
    RAISE EXCEPTION 'No account found for user %', p_user_id;
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

  -- Get existing investor units
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
    -- Update existing investor units
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
    total_deposits = COALESCE(total_deposits, 0) + p_deposit_amount,
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
      'total_units_after', v_new_total_units,
      'avg_purchase_nav', v_new_avg_nav
    )
  );

  -- Return success result
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 9: Update RLS policies with correct auth.uid() syntax
ALTER TABLE investor_units ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own investor_units" ON investor_units;
CREATE POLICY "Users can view own investor_units"
  ON investor_units
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can manage all unit holdings" ON investor_units;
CREATE POLICY "Service role can manage all unit holdings"
  ON investor_units
  FOR ALL
  TO service_role
  USING (true);

-- STEP 10: Update accounts table RLS policies
DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
CREATE POLICY "Users can view own accounts"
  ON accounts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;
CREATE POLICY "Users can update own accounts"
  ON accounts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- STEP 11: Update transactions table RLS policies  
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- STEP 12: Update fund_nav RLS policies
DROP POLICY IF EXISTS "Users can read fund NAV data" ON fund_nav;
CREATE POLICY "Users can read fund NAV data"
  ON fund_nav
  FOR SELECT
  TO authenticated
  USING (true);

-- STEP 13: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON fund_nav TO authenticated;
GRANT SELECT ON investor_units TO authenticated;
GRANT SELECT ON accounts TO authenticated;
GRANT SELECT ON transactions TO authenticated;

-- STEP 14: Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE fund_nav;
ALTER PUBLICATION supabase_realtime ADD TABLE investor_units;
ALTER PUBLICATION supabase_realtime ADD TABLE accounts;