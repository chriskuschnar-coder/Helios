/*
  # Complete Database Schema Setup

  1. New Tables
    - `users` - User profiles linked to auth.users
    - `accounts` - Trading accounts with balance tracking
    - `transactions` - All financial transactions
    - `bank_accounts` - Plaid-connected bank accounts
    - `wire_instructions` - Wire transfer instructions
    - `signed_documents` - Document signing records
    - `profiles` - User profile information
    - `onboarding` - Onboarding document tracking
    - `crypto_payment_invoices` - Cryptocurrency payment tracking
    - `payments` - Payment records for Stripe/crypto
    - `stripe_customers` - Stripe customer mapping
    - `stripe_subscriptions` - Subscription management
    - `stripe_orders` - Order tracking
    - `compliance_records` - KYC/compliance tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access own data
    - System policies for service operations

  3. Functions
    - Trigger functions for updated_at timestamps
    - Auth signup handler for automatic account creation
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
  CREATE TYPE stripe_subscription_status AS ENUM (
    'not_started',
    'incomplete', 
    'incomplete_expired',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'paused'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE stripe_order_status AS ENUM (
    'pending',
    'completed', 
    'canceled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  kyc_status text DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  two_factor_enabled boolean DEFAULT false,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  documents_completed boolean DEFAULT false,
  documents_completed_at timestamptz
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE NOT NULL REFERENCES public.users(id),
  account_type text DEFAULT 'trading' CHECK (account_type IN ('trading', 'savings')),
  balance numeric(15,2) DEFAULT 0.00,
  available_balance numeric(15,2) DEFAULT 0.00,
  total_deposits numeric(15,2) DEFAULT 0.00,
  total_withdrawals numeric(15,2) DEFAULT 0.00,
  currency text DEFAULT 'USD',
  status text DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  account_id uuid NOT NULL REFERENCES public.accounts(id),
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'fee', 'interest', 'trade')),
  method text CHECK (method IN ('stripe', 'plaid', 'crypto', 'wire', 'internal')),
  amount numeric(15,2) NOT NULL,
  fee numeric(15,2) DEFAULT 0.00,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  external_id text,
  reference_id text,
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  transaction_hash text
);

-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  plaid_account_id text NOT NULL,
  plaid_access_token text NOT NULL,
  account_name text NOT NULL,
  account_type text NOT NULL,
  account_subtype text,
  mask text,
  institution_name text NOT NULL,
  institution_id text,
  is_verified boolean DEFAULT false,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wire_instructions table
CREATE TABLE IF NOT EXISTS public.wire_instructions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  reference_code text UNIQUE NOT NULL,
  amount numeric(15,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'expired')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create signed_documents table
CREATE TABLE IF NOT EXISTS public.signed_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  document_id text NOT NULL,
  document_title text NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('investment_agreement', 'risk_disclosure', 'accredited_investor', 'subscription_agreement', 'privacy_policy')),
  signature text NOT NULL,
  signed_at timestamptz NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create onboarding table
CREATE TABLE IF NOT EXISTS public.onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  document_name text NOT NULL,
  document_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  signed_at timestamptz
);

-- Create crypto_payment_invoices table
CREATE TABLE IF NOT EXISTS public.crypto_payment_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  cryptocurrency text NOT NULL CHECK (cryptocurrency IN ('BTC', 'ETH', 'USDT', 'SOL')),
  address text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'confirmed', 'expired', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  payment_address text NOT NULL DEFAULT '',
  transaction_hash text
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  product_id text DEFAULT 'account_funding',
  quantity integer DEFAULT 1,
  total_amount numeric(15,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  stripe_session_id text,
  stripe_payment_intent_id text,
  is_paid boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  transaction_hash text
);

-- Create stripe_customers table
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id bigint PRIMARY KEY,
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id),
  customer_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Create stripe_subscriptions table
CREATE TABLE IF NOT EXISTS public.stripe_subscriptions (
  id bigint PRIMARY KEY,
  customer_id text UNIQUE NOT NULL,
  subscription_id text,
  price_id text,
  current_period_start bigint,
  current_period_end bigint,
  cancel_at_period_end boolean DEFAULT false,
  payment_method_brand text,
  payment_method_last4 text,
  status stripe_subscription_status NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Create stripe_orders table
CREATE TABLE IF NOT EXISTS public.stripe_orders (
  id bigint PRIMARY KEY,
  checkout_session_id text NOT NULL,
  payment_intent_id text NOT NULL,
  customer_id text NOT NULL,
  amount_subtotal bigint NOT NULL,
  amount_total bigint NOT NULL,
  currency text NOT NULL,
  payment_status text NOT NULL,
  status stripe_order_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Create compliance_records table
CREATE TABLE IF NOT EXISTS public.compliance_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  provider text NOT NULL CHECK (provider IN ('jumio', 'onfido', 'manual')),
  verification_type text NOT NULL CHECK (verification_type IN ('identity', 'address', 'income', 'accredited_investor')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  verification_id text,
  data_blob jsonb DEFAULT '{}',
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create crypto_addresses table
CREATE TABLE IF NOT EXISTS public.crypto_addresses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  currency text NOT NULL CHECK (currency IN ('BTC', 'ETH', 'USDC', 'USDT', 'MATIC')),
  address text NOT NULL,
  private_key_encrypted text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz,
  total_received numeric(20,8) DEFAULT 0,
  payment_count integer DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON public.bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_wire_instructions_user_id ON public.wire_instructions(user_id);
CREATE INDEX IF NOT EXISTS idx_wire_instructions_reference_code ON public.wire_instructions(reference_code);
CREATE INDEX IF NOT EXISTS idx_signed_documents_user_id ON public.signed_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_signed_documents_type ON public.signed_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_signed_documents_signed_at ON public.signed_documents(signed_at);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles(updated_at);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_user_id ON public.crypto_payment_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_status ON public.crypto_payment_invoices(status);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_address ON public.crypto_payment_invoices(payment_address);
CREATE INDEX IF NOT EXISTS idx_crypto_invoices_hash ON public.crypto_payment_invoices(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent ON public.payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_hash ON public.payments(transaction_hash) WHERE transaction_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_compliance_user_id ON public.compliance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_addresses_user_id ON public.crypto_addresses(user_id);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wire_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signed_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_payment_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_addresses ENABLE ROW LEVEL SECURITY;

-- Create trigger functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_crypto_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create auth signup handler
CREATE OR REPLACE FUNCTION handle_auth_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
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
  );
  
  RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Create triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON public.accounts;
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON public.bank_accounts;
CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_profiles_updated_at();

DROP TRIGGER IF EXISTS update_compliance_updated_at ON public.compliance_records;
CREATE TRIGGER update_compliance_updated_at
  BEFORE UPDATE ON public.compliance_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crypto_invoices_updated_at ON public.crypto_payment_invoices;
CREATE TRIGGER update_crypto_invoices_updated_at
  BEFORE UPDATE ON public.crypto_payment_invoices
  FOR EACH ROW EXECUTE FUNCTION update_crypto_invoices_updated_at();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_payments_updated_at();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_auth_signup();

-- Create RLS policies (excluding the existing "Users can view own accounts" policy)

-- Users table policies
DROP POLICY IF EXISTS "System can insert users" ON public.users;
CREATE POLICY "System can insert users" ON public.users FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data" ON public.users FOR SELECT TO public USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own document status" ON public.users;
CREATE POLICY "Users can update own document status" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Accounts table policies (SKIP the existing policy)
DROP POLICY IF EXISTS "System can insert accounts" ON public.accounts;
CREATE POLICY "System can insert accounts" ON public.accounts FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own accounts" ON public.accounts;
CREATE POLICY "Users can update own accounts" ON public.accounts FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Transactions table policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT TO public USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Bank accounts policies
DROP POLICY IF EXISTS "Users can view own bank accounts" ON public.bank_accounts;
CREATE POLICY "Users can view own bank accounts" ON public.bank_accounts FOR SELECT TO public USING (auth.uid() = user_id);

-- Wire instructions policies
DROP POLICY IF EXISTS "Users can view own wire instructions" ON public.wire_instructions;
CREATE POLICY "Users can view own wire instructions" ON public.wire_instructions FOR SELECT TO public USING (auth.uid() = user_id);

-- Signed documents policies
DROP POLICY IF EXISTS "Users can read own signed documents" ON public.signed_documents;
CREATE POLICY "Users can read own signed documents" ON public.signed_documents FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own signed documents" ON public.signed_documents;
CREATE POLICY "Users can insert own signed documents" ON public.signed_documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own signed documents" ON public.signed_documents;
CREATE POLICY "Users can update own signed documents" ON public.signed_documents FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO public USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO public WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO public USING (auth.uid() = id);

-- Onboarding policies
DROP POLICY IF EXISTS "Users can read own onboarding" ON public.onboarding;
CREATE POLICY "Users can read own onboarding" ON public.onboarding FOR SELECT TO public USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own onboarding" ON public.onboarding;
CREATE POLICY "Users can insert own onboarding" ON public.onboarding FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own onboarding" ON public.onboarding;
CREATE POLICY "Users can update own onboarding" ON public.onboarding FOR UPDATE TO public USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own onboarding" ON public.onboarding;
CREATE POLICY "Users can delete own onboarding" ON public.onboarding FOR DELETE TO public USING (auth.uid() = user_id);

-- Crypto payment invoices policies
DROP POLICY IF EXISTS "Users can view own crypto invoices" ON public.crypto_payment_invoices;
CREATE POLICY "Users can view own crypto invoices" ON public.crypto_payment_invoices FOR SELECT TO public USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own crypto invoices" ON public.crypto_payment_invoices;
CREATE POLICY "Users can insert own crypto invoices" ON public.crypto_payment_invoices FOR INSERT TO public WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "System can update crypto invoices" ON public.crypto_payment_invoices;
CREATE POLICY "System can update crypto invoices" ON public.crypto_payment_invoices FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Allow insert for service role" ON public.crypto_payment_invoices;
CREATE POLICY "Allow insert for service role" ON public.crypto_payment_invoices FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own invoices" ON public.crypto_payment_invoices;
CREATE POLICY "Users can view own invoices" ON public.crypto_payment_invoices FOR SELECT TO public USING (auth.uid() = user_id);

-- Payments policies
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "System can update payments" ON public.payments;
CREATE POLICY "System can update payments" ON public.payments FOR UPDATE TO authenticated USING (true);

-- Stripe customers policies
DROP POLICY IF EXISTS "Users can view their own customer data" ON public.stripe_customers;
CREATE POLICY "Users can view their own customer data" ON public.stripe_customers FOR SELECT TO authenticated USING ((user_id = auth.uid()) AND (deleted_at IS NULL));

-- Stripe subscriptions policies
DROP POLICY IF EXISTS "Users can view their own subscription data" ON public.stripe_subscriptions;
CREATE POLICY "Users can view their own subscription data" ON public.stripe_subscriptions FOR SELECT TO authenticated USING ((customer_id IN (SELECT stripe_customers.customer_id FROM stripe_customers WHERE ((stripe_customers.user_id = auth.uid()) AND (stripe_customers.deleted_at IS NULL)))) AND (deleted_at IS NULL));

-- Stripe orders policies
DROP POLICY IF EXISTS "Users can view their own order data" ON public.stripe_orders;
CREATE POLICY "Users can view their own order data" ON public.stripe_orders FOR SELECT TO authenticated USING ((customer_id IN (SELECT stripe_customers.customer_id FROM stripe_customers WHERE ((stripe_customers.user_id = auth.uid()) AND (stripe_customers.deleted_at IS NULL)))) AND (deleted_at IS NULL));

-- Compliance records policies
DROP POLICY IF EXISTS "Users can view own compliance records" ON public.compliance_records;
CREATE POLICY "Users can view own compliance records" ON public.compliance_records FOR SELECT TO public USING (auth.uid() = user_id);

-- Crypto addresses policies
DROP POLICY IF EXISTS "Users can view own crypto addresses" ON public.crypto_addresses;
CREATE POLICY "Users can view own crypto addresses" ON public.crypto_addresses FOR SELECT TO public USING (auth.uid() = user_id);

-- Create views
CREATE OR REPLACE VIEW stripe_user_subscriptions
WITH (security_definer = true)
AS
SELECT 
  sc.customer_id,
  ss.subscription_id,
  ss.status as subscription_status,
  ss.price_id,
  ss.current_period_start,
  ss.current_period_end,
  ss.cancel_at_period_end,
  ss.payment_method_brand,
  ss.payment_method_last4
FROM stripe_customers sc
LEFT JOIN stripe_subscriptions ss ON sc.customer_id = ss.customer_id
WHERE sc.deleted_at IS NULL AND (ss.deleted_at IS NULL OR ss.deleted_at IS NULL);

CREATE OR REPLACE VIEW stripe_user_orders
WITH (security_definer = true)
AS
SELECT 
  sc.customer_id,
  so.id as order_id,
  so.checkout_session_id,
  so.payment_intent_id,
  so.amount_subtotal,
  so.amount_total,
  so.currency,
  so.payment_status,
  so.status as order_status,
  so.created_at as order_date
FROM stripe_customers sc
LEFT JOIN stripe_orders so ON sc.customer_id = so.customer_id
WHERE sc.deleted_at IS NULL AND (so.deleted_at IS NULL OR so.deleted_at IS NULL);