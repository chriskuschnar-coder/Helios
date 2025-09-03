/*
  # Fix existing schema conflicts and ensure proper setup

  1. Handle existing types and tables safely
  2. Ensure all required tables exist with proper structure
  3. Set up Row Level Security policies
  4. Create necessary triggers and functions
  5. Insert demo data safely
*/

-- Handle existing types safely
DO $$ 
BEGIN
  -- Only create types if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stripe_subscription_status') THEN
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
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stripe_order_status') THEN
    CREATE TYPE stripe_order_status AS ENUM (
      'pending',
      'completed',
      'canceled'
    );
  END IF;
END $$;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure users table exists with proper structure
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    CREATE TABLE users (
      id uuid PRIMARY KEY REFERENCES auth.users(id),
      email text UNIQUE NOT NULL,
      full_name text,
      phone text,
      kyc_status text DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
      two_factor_enabled boolean DEFAULT false,
      last_login timestamptz,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Ensure accounts table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'accounts' AND table_schema = 'public') THEN
    CREATE TABLE accounts (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id uuid NOT NULL REFERENCES users(id),
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
  END IF;
END $$;

-- Ensure transactions table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions' AND table_schema = 'public') THEN
    CREATE TABLE transactions (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id uuid NOT NULL REFERENCES users(id),
      account_id uuid NOT NULL REFERENCES accounts(id),
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
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Ensure payments table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments' AND table_schema = 'public') THEN
    CREATE TABLE payments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id),
      product_id text DEFAULT 'account_funding',
      quantity integer DEFAULT 1,
      total_amount numeric(15,2) NOT NULL,
      status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
      stripe_session_id text,
      stripe_payment_intent_id text,
      is_paid boolean DEFAULT false,
      metadata jsonb DEFAULT '{}',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Create indexes safely
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);

-- Enable Row Level Security safely
DO $$
BEGIN
  -- Enable RLS on all tables
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'accounts' AND table_schema = 'public') THEN
    ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions' AND table_schema = 'public') THEN
    ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments' AND table_schema = 'public') THEN
    ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create RLS policies safely
DO $$
BEGIN
  -- Users policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view own data') THEN
    CREATE POLICY "Users can view own data" ON users
      FOR SELECT TO public
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own data') THEN
    CREATE POLICY "Users can update own data" ON users
      FOR UPDATE TO public
      USING (auth.uid() = id);
  END IF;

  -- Accounts policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounts' AND policyname = 'Users can view own accounts') THEN
    CREATE POLICY "Users can view own accounts" ON accounts
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounts' AND policyname = 'Users can update own accounts') THEN
    CREATE POLICY "Users can update own accounts" ON accounts
      FOR UPDATE TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Transactions policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can view own transactions') THEN
    CREATE POLICY "Users can view own transactions" ON transactions
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can insert own transactions') THEN
    CREATE POLICY "Users can insert own transactions" ON transactions
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Payments policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can view own payments') THEN
    CREATE POLICY "Users can view own payments" ON payments
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can insert own payments') THEN
    CREATE POLICY "Users can insert own payments" ON payments
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'System can update payments') THEN
    CREATE POLICY "System can update payments" ON payments
      FOR UPDATE TO authenticated
      USING (true);
  END IF;
END $$;

-- Create trigger functions safely
CREATE OR REPLACE FUNCTION update_updated_at_column()
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

CREATE OR REPLACE FUNCTION create_user_account()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table
  INSERT INTO users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    updated_at = now();
  
  -- Create trading account if it doesn't exist
  INSERT INTO accounts (user_id, account_type, balance, available_balance)
  VALUES (NEW.id, 'trading', 0.00, 0.00)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers safely
DO $$
BEGIN
  -- Drop existing triggers if they exist
  DROP TRIGGER IF EXISTS update_users_updated_at ON users;
  DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
  DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
  DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
  DROP TRIGGER IF EXISTS create_user_account_trigger ON auth.users;

  -- Create new triggers
  CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_payments_updated_at();

  CREATE TRIGGER create_user_account_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_account();
END $$;