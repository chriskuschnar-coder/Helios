/*
  # Fix Authentication and User Account Creation

  This migration fixes the broken database triggers that were preventing user signup.

  1. Database Cleanup
     - Remove all conflicting triggers and functions
     - Clean up any broken references

  2. User Account System
     - Recreate the user account creation trigger
     - Ensure proper RLS policies
     - Fix the users table structure

  3. Security
     - Proper RLS policies for all tables
     - Secure trigger functions
*/

-- First, clean up any existing broken triggers and functions
DROP TRIGGER IF EXISTS create_account_for_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_user_account_trigger ON auth.users;
DROP FUNCTION IF EXISTS create_user_account() CASCADE;

-- Ensure the users table exists with proper structure
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  kyc_status text DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  two_factor_enabled boolean DEFAULT false,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

CREATE POLICY "Users can view own data"
  ON public.users
  FOR SELECT
  TO public
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO public
  USING (auth.uid() = id);

-- Create the user account creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into public.users table
  INSERT INTO public.users (id, email, full_name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    now()
  );

  -- Create a default trading account for the user
  INSERT INTO public.accounts (user_id, account_type, balance, available_balance, currency, status, created_at)
  VALUES (
    NEW.id,
    'trading',
    0.00,
    0.00,
    'USD',
    'active',
    now()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure accounts table has proper RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Update accounts RLS policies
DROP POLICY IF EXISTS "Users can view own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON public.accounts;

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

-- Allow users to insert their own accounts (needed for the trigger)
CREATE POLICY "System can insert accounts"
  ON public.accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow system to insert users (needed for the trigger)
CREATE POLICY "System can insert users"
  ON public.users
  FOR INSERT
  TO public
  WITH CHECK (true);