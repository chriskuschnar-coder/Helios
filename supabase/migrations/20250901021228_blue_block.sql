/*
  # Fix User Account Creation System

  1. Cleanup
    - Remove conflicting triggers and function using CASCADE
    - Clean slate for proper user account creation

  2. New Function
    - Create proper user account creation function
    - Handle all required fields with defaults
    - Proper error handling

  3. New Trigger
    - Single trigger for user account creation
    - Fires after user signup in auth.users
*/

-- Drop the old function and all its dependent triggers using CASCADE
DROP FUNCTION IF EXISTS create_user_account() CASCADE;

-- Create new improved function for user account creation
CREATE OR REPLACE FUNCTION create_user_account()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users table
  INSERT INTO public.users (
    id,
    email,
    full_name,
    phone,
    kyc_status,
    two_factor_enabled,
    last_login,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'pending',
    false,
    now(),
    now(),
    now()
  );

  -- Insert into accounts table with default values
  INSERT INTO public.accounts (
    user_id,
    account_type,
    balance,
    available_balance,
    total_deposits,
    total_withdrawals,
    currency,
    status,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    'trading',
    0.00,
    0.00,
    0.00,
    0.00,
    'USD',
    'active',
    now(),
    now()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating user account: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER create_user_account_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_account();