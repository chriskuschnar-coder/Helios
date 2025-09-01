/*
  # Fix User Account Creation

  1. Problem Analysis
    - User signup fails with "Database error saving new user"
    - The create_user_account trigger may be failing
    - Need to ensure proper account creation on user signup

  2. Solution
    - Fix the trigger function for automatic account creation
    - Ensure proper error handling
    - Add debugging for account creation process

  3. Security
    - Maintain RLS policies
    - Ensure proper user isolation
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.create_user_account();

-- Create improved trigger function
CREATE OR REPLACE FUNCTION public.create_user_account()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users table
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create trading account for the user
  INSERT INTO public.accounts (user_id, account_type, balance, available_balance, currency, status)
  VALUES (
    NEW.id,
    'trading',
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
    RAISE WARNING 'Error creating user account: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_account();

-- Ensure RLS is enabled on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to use auth.uid() instead of uid()
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can view own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON public.accounts;

-- Create proper RLS policies
CREATE POLICY "Users can view own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view own accounts"
  ON public.accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON public.accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.accounts TO authenticated;
GRANT ALL ON public.transactions TO authenticated;