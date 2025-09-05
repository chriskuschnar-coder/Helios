/*
  # Sync All Users to Investor Units System

  1. Backfill Existing Users
    - Create investor_units records for all existing users who don't have them
    - Ensure every user has a portfolio tracking record
    - Set default values (0 units, 0 invested, 0 current value)

  2. Auto-Sync Functions
    - Trigger function to auto-create investor_units on new user signup
    - Ensure seamless integration for both existing and new users

  3. Portfolio Synchronization
    - Link all users to fund NAV system
    - Prepare for live MT5 integration
    - Enable real-time portfolio updates
*/

-- STEP 1: Backfill existing users who don't have investor_units records
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
LEFT JOIN investor_units iu ON iu.user_id = u.id AND iu.account_id = a.id
WHERE iu.id IS NULL;

-- STEP 2: Create function to auto-sync new users
CREATE OR REPLACE FUNCTION create_investor_units_for_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- STEP 3: Create trigger to auto-create investor_units for new accounts
DROP TRIGGER IF EXISTS auto_create_investor_units ON accounts;
CREATE TRIGGER auto_create_investor_units
  AFTER INSERT ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION create_investor_units_for_new_user();

-- STEP 4: Create function to update all investor portfolios when NAV changes
CREATE OR REPLACE FUNCTION update_all_investor_portfolios()
RETURNS TRIGGER AS $$
DECLARE
  investor_record RECORD;
BEGIN
  -- Update all investor portfolios with new NAV
  FOR investor_record IN 
    SELECT id, units_held, total_invested 
    FROM investor_units 
    WHERE units_held > 0
  LOOP
    UPDATE investor_units
    SET 
      current_value = units_held * NEW.nav_per_unit,
      unrealized_pnl = (units_held * NEW.nav_per_unit) - total_invested,
      last_nav_update = NEW.updated_at,
      updated_at = now()
    WHERE id = investor_record.id;
  END LOOP;
  
  -- Also update main accounts table for dashboard display
  UPDATE accounts 
  SET 
    balance = iu.current_value,
    available_balance = iu.current_value,
    nav_per_unit = NEW.nav_per_unit,
    updated_at = now()
  FROM investor_units iu
  WHERE accounts.id = iu.account_id
    AND iu.units_held > 0;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 5: Create trigger to auto-update all portfolios when NAV changes
DROP TRIGGER IF EXISTS auto_update_investor_portfolios ON fund_nav;
CREATE TRIGGER auto_update_investor_portfolios
  AFTER INSERT OR UPDATE ON fund_nav
  FOR EACH ROW
  EXECUTE FUNCTION update_all_investor_portfolios();

-- STEP 6: Create function to handle new deposits and convert to fund units
CREATE OR REPLACE FUNCTION process_user_deposit(
  p_user_id uuid,
  p_deposit_amount numeric,
  p_method text DEFAULT 'stripe',
  p_description text DEFAULT 'Investment deposit'
)
RETURNS json AS $$
DECLARE
  v_account_id uuid;
  v_current_nav numeric(10,4);
  v_units_to_issue numeric(15,4);
  v_investor_units_id uuid;
  v_existing_units numeric(15,4) := 0;
  v_existing_invested numeric(15,2) := 0;
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
  
  -- Get current NAV per unit (latest from fund_nav)
  SELECT nav_per_unit INTO v_current_nav
  FROM fund_nav
  ORDER BY date DESC
  LIMIT 1;
  
  -- Default to $1000 if no NAV exists yet
  IF v_current_nav IS NULL THEN
    v_current_nav := 1000.0000;
  END IF;
  
  -- Calculate units to issue
  v_units_to_issue := p_deposit_amount / v_current_nav;
  
  -- Get existing investor units (if any)
  SELECT id, units_held, total_invested 
  INTO v_investor_units_id, v_existing_units, v_existing_invested
  FROM investor_units
  WHERE user_id = p_user_id AND account_id = v_account_id;
  
  -- Calculate new totals
  v_new_total_units := v_existing_units + v_units_to_issue;
  v_new_total_invested := v_existing_invested + p_deposit_amount;
  v_new_avg_nav := v_new_total_invested / v_new_total_units;
  
  -- Update or insert investor_units record
  IF v_investor_units_id IS NOT NULL THEN
    -- Update existing record
    UPDATE investor_units
    SET 
      units_held = v_new_total_units,
      avg_purchase_nav = v_new_avg_nav,
      total_invested = v_new_total_invested,
      current_value = v_new_total_units * v_current_nav,
      unrealized_pnl = (v_new_total_units * v_current_nav) - v_new_total_invested,
      last_nav_update = now(),
      updated_at = now()
    WHERE id = v_investor_units_id;
  ELSE
    -- Create new record
    INSERT INTO investor_units (
      user_id, account_id, units_held, avg_purchase_nav, 
      total_invested, current_value, unrealized_pnl
    ) VALUES (
      p_user_id, v_account_id, v_units_to_issue, v_current_nav,
      p_deposit_amount, p_deposit_amount, 0
    );
  END IF;
  
  -- Update main accounts table for dashboard display
  UPDATE accounts
  SET 
    balance = v_new_total_units * v_current_nav,
    available_balance = v_new_total_units * v_current_nav,
    total_deposits = total_deposits + p_deposit_amount,
    units_held = v_new_total_units,
    nav_per_unit = v_current_nav,
    updated_at = now()
  WHERE id = v_account_id;
  
  -- Create transaction record
  INSERT INTO transactions (
    user_id, account_id, type, method, amount, status, description
  ) VALUES (
    p_user_id, v_account_id, 'deposit', p_method, p_deposit_amount, 'completed', p_description
  );
  
  -- Create fund transaction record
  INSERT INTO fund_transactions (
    user_id, account_id, type, amount, units, nav_per_unit, status
  ) VALUES (
    p_user_id, v_account_id, 'subscription', p_deposit_amount, v_units_to_issue, v_current_nav, 'confirmed'
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
$$ LANGUAGE plpgsql;

-- STEP 7: Enable Row Level Security policies for investor_units
ALTER TABLE investor_units ENABLE ROW LEVEL SECURITY;

-- Users can read their own unit holdings
CREATE POLICY "Users can read own unit holdings"
  ON investor_units
  FOR SELECT
  TO authenticated
  USING (uid() = user_id);

-- Service role can manage all unit holdings (for MT5 bot updates)
CREATE POLICY "Service role can manage all unit holdings"
  ON investor_units
  FOR ALL
  TO service_role
  USING (true);

-- STEP 8: Enable Row Level Security for fund_nav
ALTER TABLE fund_nav ENABLE ROW LEVEL SECURITY;

-- Users can read fund NAV data
CREATE POLICY "Users can read fund NAV data"
  ON fund_nav
  FOR SELECT
  TO authenticated
  USING (true);

-- Service role can manage fund NAV (for MT5 bot updates)
CREATE POLICY "Service role can manage fund NAV"
  ON fund_nav
  FOR ALL
  TO service_role
  USING (true);

-- STEP 9: Enable Row Level Security for mt5_data_feed
ALTER TABLE mt5_data_feed ENABLE ROW LEVEL SECURITY;

-- Only service role can access MT5 data (for security)
CREATE POLICY "Only service role can access MT5 data"
  ON mt5_data_feed
  FOR ALL
  TO service_role
  USING (true);