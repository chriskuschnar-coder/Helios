/*
  # Fix All uid() Function Errors in RLS Policies

  This migration fixes all existing RLS policies that use uid() instead of auth.uid().
  The error "function uid() does not exist" occurs because Supabase requires auth.uid().

  ## What This Fixes
  1. All RLS policies across all tables
  2. Replaces uid() with auth.uid() everywhere
  3. Maintains exact same security logic
  4. Fixes the PostgreSQL function error

  ## Tables Updated
  - users, accounts, transactions, payments
  - compliance_records, crypto_addresses, bank_accounts
  - wire_instructions, signed_documents, profiles
  - onboarding, crypto_payment_invoices
  - fund_transactions, investor_units, fund_nav
  - stripe_customers, stripe_subscriptions, stripe_orders
*/

-- Drop and recreate all policies with correct auth.uid() function

-- USERS TABLE POLICIES
DROP POLICY IF EXISTS "System can insert users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can update own document status" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;

CREATE POLICY "System can insert users" ON users
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own document status" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own data" ON users
  FOR SELECT TO public
  USING (auth.uid() = id);

-- ACCOUNTS TABLE POLICIES
DROP POLICY IF EXISTS "System can insert accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;

CREATE POLICY "System can insert accounts" ON accounts
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own accounts" ON accounts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own accounts" ON accounts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- TRANSACTIONS TABLE POLICIES
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT TO public
  USING (auth.uid() = user_id);

-- PAYMENTS TABLE POLICIES
DROP POLICY IF EXISTS "System can update payments" ON payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;

CREATE POLICY "System can update payments" ON payments
  FOR UPDATE TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- COMPLIANCE RECORDS POLICIES
DROP POLICY IF EXISTS "Users can view own compliance records" ON compliance_records;

CREATE POLICY "Users can view own compliance records" ON compliance_records
  FOR SELECT TO public
  USING (auth.uid() = user_id);

-- CRYPTO ADDRESSES POLICIES
DROP POLICY IF EXISTS "Users can view own crypto addresses" ON crypto_addresses;

CREATE POLICY "Users can view own crypto addresses" ON crypto_addresses
  FOR SELECT TO public
  USING (auth.uid() = user_id);

-- BANK ACCOUNTS POLICIES
DROP POLICY IF EXISTS "Users can view own bank accounts" ON bank_accounts;

CREATE POLICY "Users can view own bank accounts" ON bank_accounts
  FOR SELECT TO public
  USING (auth.uid() = user_id);

-- WIRE INSTRUCTIONS POLICIES
DROP POLICY IF EXISTS "Users can view own wire instructions" ON wire_instructions;

CREATE POLICY "Users can view own wire instructions" ON wire_instructions
  FOR SELECT TO public
  USING (auth.uid() = user_id);

-- SIGNED DOCUMENTS POLICIES
DROP POLICY IF EXISTS "Users can insert own signed documents" ON signed_documents;
DROP POLICY IF EXISTS "Users can read own signed documents" ON signed_documents;
DROP POLICY IF EXISTS "Users can update own signed documents" ON signed_documents;

CREATE POLICY "Users can insert own signed documents" ON signed_documents
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own signed documents" ON signed_documents
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own signed documents" ON signed_documents
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT TO public
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO public
  USING (auth.uid() = id);

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO public
  USING (auth.uid() = id);

-- ONBOARDING POLICIES
DROP POLICY IF EXISTS "Users can delete own onboarding" ON onboarding;
DROP POLICY IF EXISTS "Users can insert own onboarding" ON onboarding;
DROP POLICY IF EXISTS "Users can read own onboarding" ON onboarding;
DROP POLICY IF EXISTS "Users can update own onboarding" ON onboarding;

CREATE POLICY "Users can delete own onboarding" ON onboarding
  FOR DELETE TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding" ON onboarding
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own onboarding" ON onboarding
  FOR SELECT TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding" ON onboarding
  FOR UPDATE TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CRYPTO PAYMENT INVOICES POLICIES
DROP POLICY IF EXISTS "Users can insert own crypto invoices" ON crypto_payment_invoices;
DROP POLICY IF EXISTS "Users can view own crypto invoices" ON crypto_payment_invoices;
DROP POLICY IF EXISTS "Users can view own invoices" ON crypto_payment_invoices;

CREATE POLICY "Users can insert own crypto invoices" ON crypto_payment_invoices
  FOR INSERT TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own crypto invoices" ON crypto_payment_invoices
  FOR SELECT TO public
  USING (auth.uid() = user_id);

-- FUND TRANSACTIONS POLICIES
DROP POLICY IF EXISTS "Users can insert own fund transactions" ON fund_transactions;
DROP POLICY IF EXISTS "Users can read own fund transactions" ON fund_transactions;

CREATE POLICY "Users can insert own fund transactions" ON fund_transactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own fund transactions" ON fund_transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- INVESTOR UNITS POLICIES
DROP POLICY IF EXISTS "Users can read own unit holdings" ON investor_units;
DROP POLICY IF EXISTS "Users can view own investor_units" ON investor_units;

CREATE POLICY "Users can read own unit holdings" ON investor_units
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- FUND NAV POLICIES
DROP POLICY IF EXISTS "Users can read fund NAV data" ON fund_nav;

CREATE POLICY "Users can read fund NAV data" ON fund_nav
  FOR SELECT TO authenticated
  USING (true);

-- STRIPE CUSTOMERS POLICIES
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;

CREATE POLICY "Users can view their own customer data" ON stripe_customers
  FOR SELECT TO authenticated
  USING ((auth.uid() = user_id) AND (deleted_at IS NULL));

-- STRIPE SUBSCRIPTIONS POLICIES  
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;

CREATE POLICY "Users can view their own subscription data" ON stripe_subscriptions
  FOR SELECT TO authenticated
  USING ((customer_id IN (
    SELECT stripe_customers.customer_id
    FROM stripe_customers
    WHERE ((stripe_customers.user_id = auth.uid()) AND (stripe_customers.deleted_at IS NULL))
  )) AND (deleted_at IS NULL));

-- STRIPE ORDERS POLICIES
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;

CREATE POLICY "Users can view their own order data" ON stripe_orders
  FOR SELECT TO authenticated
  USING ((customer_id IN (
    SELECT stripe_customers.customer_id
    FROM stripe_customers
    WHERE ((stripe_customers.user_id = auth.uid()) AND (stripe_customers.deleted_at IS NULL))
  )) AND (deleted_at IS NULL));

-- Ensure all tables have RLS enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wire_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signed_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_payment_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_nav ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;