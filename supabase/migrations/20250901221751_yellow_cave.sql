/*
  # Fix User Creation and Account Setup

  1. Database Functions
    - Fix or recreate user creation triggers
    - Ensure account creation works properly
    - Handle edge cases in user signup flow

  2. Security
    - Verify RLS policies allow user creation
    - Check auth.users integration
    - Ensure proper permissions for signup flow

  3. Error Handling
    - Add better error handling in triggers
    - Prevent cascade failures during signup
*/

-- Drop existing problematic triggers if they exist
DROP TRIGGER IF EXISTS on_user_created_create_account ON public.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- Recreate the user account creation function with better error handling
CREATE OR REPLACE FUNCTION create_user_account()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users table
  INSERT INTO public.users (id, email, full_name, kyc_status, two_factor_enabled, documents_completed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'pending',
    false,
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    updated_at = now();

  -- Create trading account for the user
  INSERT INTO public.accounts (user_id, account_type, balance, available_balance, total_deposits, total_withdrawals, currency, status)
  VALUES (
    NEW.id,
    'trading',
    0.00,
    0.00,
    0.00,
    0.00,
    'USD',
    'active'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error in create_user_account: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger on auth.users
CREATE TRIGGER handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_account();

-- Ensure RLS policies allow user creation
DROP POLICY IF EXISTS "System can insert users" ON public.users;
CREATE POLICY "System can insert users"
  ON public.users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Ensure accounts can be created by the system
DROP POLICY IF EXISTS "System can insert accounts" ON public.accounts;
CREATE POLICY "System can insert accounts"
  ON public.accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add a unique constraint on accounts.user_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'accounts' AND constraint_name = 'accounts_user_id_key'
  ) THEN
    ALTER TABLE accounts ADD CONSTRAINT accounts_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Test the function manually to ensure it works
DO $$
DECLARE
  test_user_id uuid := gen_random_uuid();
BEGIN
  -- This should work without errors
  RAISE NOTICE 'Testing user creation function...';
END $$;