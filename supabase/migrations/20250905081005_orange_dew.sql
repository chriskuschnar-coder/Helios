/*
  # Sync All Users to Investor Units System

  1. Backfill existing users to investor_units table
  2. Create database function for processing user deposits
  3. Update RLS policies to use correct auth.uid() function
  4. Ensure all users can see fund data and their portfolio

  This migration prepares the system for live MT5 trading integration.
*/

-- STEP 1: Backfill existing users to investor_units (FIXED uid() issue)
INSERT INTO investor_units (user_id, account_id, units_held, total_invested, current_value)
SELECT u.id, a.id, 0, 0, 0
FROM auth.users u
JOIN accounts a ON a.user_id = u.id
LEFT JOIN investor_units iu ON iu.user_id = u.id
WHERE iu.id IS NULL;

-- STEP 2: Create function to process user deposits with fund unit allocation
CREATE OR REPLACE FUNCTION process_user_deposit(
  p_user_id uuid,
  p_deposit_amount numeric,
  p_method text DEFAULT 'stripe',
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
  v_existing_units record;
  v_new_total_units numeric(15,4);
  v_new_total_invested numeric(15,2);
  v_new_avg_nav numeric(10,4);
  v_new_current_value numeric(15,2);
  v_new_unrealized_pnl numeric(15,2);
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

  -- Get existing investor units record
  SELECT * INTO v_existing_units
  FROM investor_units
  WHERE user_id = p_user_id AND account_id = v_account_id;

  -- Calculate new totals
  v_new_total_units := COALESCE(v_existing_units.units_held, 0) + v_units_to_issue;
  v_new_total_invested := COALESCE(v_existing_units.total_invested, 0) + p_deposit_amount;
  v_new_avg_nav := v_new_total_invested / v_new_total_units;
  v_new_current_value := v_new_total_units * v_current_nav;
  v_new_unrealized_pnl := v_new_current_value - v_new_total_invested;

  -- Update or insert investor units
  INSERT INTO investor_units (
    user_id, account_id, units_held, avg_purchase_nav, 
    total_invested, current_value, unrealized_pnl, last_nav_update
  )
  VALUES (
    p_user_id, v_account_id, v_new_total_units, v_new_avg_nav,
    v_new_total_invested, v_new_current_value, v_new_unrealized_pnl, now()
  )
  ON CONFLICT (user_id, account_id)
  DO UPDATE SET
    units_held = v_new_total_units,
    avg_purchase_nav = v_new_avg_nav,
    total_invested = v_new_total_invested,
    current_value = v_new_current_value,
    unrealized_pnl = v_new_unrealized_pnl,
    last_nav_update = now(),
    updated_at = now();

  -- Update main accounts table for dashboard display
  UPDATE accounts
  SET 
    balance = v_new_current_value,
    available_balance = v_new_current_value,
    total_deposits = COALESCE(total_deposits, 0) + p_deposit_amount,
    units_held = v_new_total_units,
    nav_per_unit = v_current_nav,
    updated_at = now()
  WHERE id = v_account_id;

  -- Create transaction record
  INSERT INTO transactions (
    user_id, account_id, type, method, amount, status, description,
    metadata
  )
  VALUES (
    p_user_id, v_account_id, 'deposit', p_method, p_deposit_amount, 'completed', p_description,
    jsonb_build_object(
      'units_issued', v_units_to_issue,
      'nav_per_unit', v_current_nav,
      'fund_allocation', true
    )
  );

  -- Return success with details
  RETURN json_build_object(
    'success', true,
    'units_issued', v_units_to_issue,
    'nav_per_unit', v_current_nav,
    'new_balance', v_new_current_value,
    'total_invested', v_new_total_invested,
    'unrealized_pnl', v_new_unrealized_pnl
  );
END;
$$;

-- STEP 3: Fix RLS policies to use correct auth.uid() function
DROP POLICY IF EXISTS "Users can view own compliance records" ON compliance_records;
CREATE POLICY "Users can view own compliance records"
  ON compliance_records
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own document status" ON users;
CREATE POLICY "Users can update own document status"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  TO public
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
CREATE POLICY "Users can view own accounts"
  ON accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;
CREATE POLICY "Users can update own accounts"
  ON accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own crypto addresses" ON crypto_addresses;
CREATE POLICY "Users can view own crypto addresses"
  ON crypto_addresses
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
  ON transactions
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own wire instructions" ON wire_instructions;
CREATE POLICY "Users can view own wire instructions"
  ON wire_instructions
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own signed documents" ON signed_documents;
CREATE POLICY "Users can read own signed documents"
  ON signed_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own signed documents" ON signed_documents;
CREATE POLICY "Users can insert own signed documents"
  ON signed_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own signed documents" ON signed_documents;
CREATE POLICY "Users can update own signed documents"
  ON signed_documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO public
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO public
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read own onboarding" ON onboarding;
CREATE POLICY "Users can read own onboarding"
  ON onboarding
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own onboarding" ON onboarding;
CREATE POLICY "Users can insert own onboarding"
  ON onboarding
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own onboarding" ON onboarding;
CREATE POLICY "Users can update own onboarding"
  ON onboarding
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own onboarding" ON onboarding;
CREATE POLICY "Users can delete own onboarding"
  ON onboarding
  FOR DELETE
  TO public
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own crypto invoices" ON crypto_payment_invoices;
CREATE POLICY "Users can view own crypto invoices"
  ON crypto_payment_invoices
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own invoices" ON crypto_payment_invoices;
CREATE POLICY "Users can view own invoices"
  ON crypto_payment_invoices
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own crypto invoices" ON crypto_payment_invoices;
CREATE POLICY "Users can insert own crypto invoices"
  ON crypto_payment_invoices
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
CREATE POLICY "Users can insert own payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own fund transactions" ON fund_transactions;
CREATE POLICY "Users can read own fund transactions"
  ON fund_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own fund transactions" ON fund_transactions;
CREATE POLICY "Users can insert own fund transactions"
  ON fund_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own unit holdings" ON investor_units;
CREATE POLICY "Users can read own unit holdings"
  ON investor_units
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- STEP 4: Create trigger to auto-create investor_units for new users
CREATE OR REPLACE FUNCTION create_investor_units_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Wait for account to be created first, then create investor_units
  INSERT INTO investor_units (user_id, account_id, units_held, total_invested, current_value)
  SELECT NEW.user_id, NEW.id, 0, 0, 0
  WHERE NOT EXISTS (
    SELECT 1 FROM investor_units WHERE user_id = NEW.user_id AND account_id = NEW.id
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger on accounts table (fires after account creation)
DROP TRIGGER IF EXISTS create_investor_units_trigger ON accounts;
CREATE TRIGGER create_investor_units_trigger
  AFTER INSERT ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION create_investor_units_for_new_user();

-- STEP 5: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION process_user_deposit TO authenticated;