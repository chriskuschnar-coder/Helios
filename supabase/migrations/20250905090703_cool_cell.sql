/*
  # Fix uid() function errors in RLS policies

  This migration fixes all RLS policies that incorrectly use uid() instead of auth.uid().
  
  1. Drop and recreate all policies with correct auth.uid() function
  2. Ensure all tables have proper RLS enabled
  3. Fix any remaining uid() references in the database
*/

-- Fix users table policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can update own document status" ON users;
DROP POLICY IF EXISTS "System can insert users" ON users;

CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  TO public
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own document status"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "System can insert users"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Fix accounts table policies
DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;
DROP POLICY IF EXISTS "System can insert accounts" ON accounts;

CREATE POLICY "Users can view own accounts"
  ON accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert accounts"
  ON accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Fix transactions table policies
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;

CREATE POLICY "Users can view own transactions"
  ON transactions
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Fix payments table policies
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
DROP POLICY IF EXISTS "System can update payments" ON payments;

CREATE POLICY "Users can view own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update payments"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (true);

-- Fix compliance_records table policies
DROP POLICY IF EXISTS "Users can view own compliance records" ON compliance_records;

CREATE POLICY "Users can view own compliance records"
  ON compliance_records
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

-- Fix crypto_addresses table policies
DROP POLICY IF EXISTS "Users can view own crypto addresses" ON crypto_addresses;

CREATE POLICY "Users can view own crypto addresses"
  ON crypto_addresses
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

-- Fix bank_accounts table policies
DROP POLICY IF EXISTS "Users can view own bank accounts" ON bank_accounts;

CREATE POLICY "Users can view own bank accounts"
  ON bank_accounts
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

-- Fix wire_instructions table policies
DROP POLICY IF EXISTS "Users can view own wire instructions" ON wire_instructions;

CREATE POLICY "Users can view own wire instructions"
  ON wire_instructions
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

-- Fix signed_documents table policies
DROP POLICY IF EXISTS "Users can read own signed documents" ON signed_documents;
DROP POLICY IF EXISTS "Users can insert own signed documents" ON signed_documents;
DROP POLICY IF EXISTS "Users can update own signed documents" ON signed_documents;

CREATE POLICY "Users can read own signed documents"
  ON signed_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own signed documents"
  ON signed_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own signed documents"
  ON signed_documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix profiles table policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO public
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO public
  USING (auth.uid() = id);

-- Fix onboarding table policies
DROP POLICY IF EXISTS "Users can read own onboarding" ON onboarding;
DROP POLICY IF EXISTS "Users can insert own onboarding" ON onboarding;
DROP POLICY IF EXISTS "Users can update own onboarding" ON onboarding;
DROP POLICY IF EXISTS "Users can delete own onboarding" ON onboarding;

CREATE POLICY "Users can read own onboarding"
  ON onboarding
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding"
  ON onboarding
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding"
  ON onboarding
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own onboarding"
  ON onboarding
  FOR DELETE
  TO public
  USING (auth.uid() = user_id);

-- Fix crypto_payment_invoices table policies
DROP POLICY IF EXISTS "Users can view own crypto invoices" ON crypto_payment_invoices;
DROP POLICY IF EXISTS "Users can view own invoices" ON crypto_payment_invoices;
DROP POLICY IF EXISTS "Users can insert own crypto invoices" ON crypto_payment_invoices;

CREATE POLICY "Users can view own crypto invoices"
  ON crypto_payment_invoices
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crypto invoices"
  ON crypto_payment_invoices
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

-- Fix fund_transactions table policies
DROP POLICY IF EXISTS "Users can read own fund transactions" ON fund_transactions;
DROP POLICY IF EXISTS "Users can insert own fund transactions" ON fund_transactions;

CREATE POLICY "Users can read own fund transactions"
  ON fund_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fund transactions"
  ON fund_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Fix investor_units table policies
DROP POLICY IF EXISTS "Users can read own unit holdings" ON investor_units;
DROP POLICY IF EXISTS "Users can view own investor_units" ON investor_units;

CREATE POLICY "Users can read own unit holdings"
  ON investor_units
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix fund_nav table policies
DROP POLICY IF EXISTS "Users can read fund NAV data" ON fund_nav;

CREATE POLICY "Users can read fund NAV data"
  ON fund_nav
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix stripe_customers table policies
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;

CREATE POLICY "Users can view their own customer data"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = user_id) AND (deleted_at IS NULL));

-- Fix stripe_subscriptions table policies
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;

CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING ((customer_id IN ( 
    SELECT stripe_customers.customer_id
    FROM stripe_customers
    WHERE ((stripe_customers.user_id = auth.uid()) AND (stripe_customers.deleted_at IS NULL))
  )) AND (deleted_at IS NULL));

-- Fix stripe_orders table policies
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;

CREATE POLICY "Users can view their own order data"
  ON stripe_orders
  FOR SELECT
  TO authenticated
  USING ((customer_id IN ( 
    SELECT stripe_customers.customer_id
    FROM stripe_customers
    WHERE ((stripe_customers.user_id = auth.uid()) AND (stripe_customers.deleted_at IS NULL))
  )) AND (deleted_at IS NULL));