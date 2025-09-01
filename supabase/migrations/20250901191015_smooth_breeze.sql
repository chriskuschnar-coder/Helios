/*
  # Fix user creation triggers and policies

  1. Database Functions
    - Ensure user creation triggers work properly
    - Fix account creation for new users
    - Update RLS policies for proper access

  2. Security
    - Enable proper RLS policies
    - Allow system to create accounts for new users
    - Ensure triggers have proper permissions
*/

-- First, let's make sure the trigger function exists and works
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users table
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to create user account
CREATE OR REPLACE FUNCTION create_user_account()
RETURNS TRIGGER AS $$
BEGIN
  -- Create account for the new user
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the account creation trigger
DROP TRIGGER IF EXISTS on_user_created_create_account ON public.users;
CREATE TRIGGER on_user_created_create_account
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION create_user_account();

-- Update RLS policies to allow system operations
DROP POLICY IF EXISTS "System can insert users" ON public.users;
CREATE POLICY "System can insert users"
  ON public.users
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert accounts" ON public.accounts;
CREATE POLICY "System can insert accounts"
  ON public.accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure the update function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Make sure all tables have proper RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;