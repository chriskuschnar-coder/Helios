/*
  # Fix crypto payment invoices constraints with proper DO block syntax

  1. Table Updates
    - Fix cryptocurrency constraint to use proper values ('BTC', 'ETH', 'USDT', 'SOL')
    - Fix status constraint to include all valid statuses
    
  2. Security
    - Add missing INSERT policy for crypto payment invoices
    - Enable RLS if not already enabled
    
  3. Implementation Notes
    - Uses EXECUTE within DO blocks for proper DDL execution
    - Double single quotes for string escaping within EXECUTE
    - Fully idempotent - checks pg_constraint catalog before creating
*/

-- Ensure RLS is enabled
ALTER TABLE crypto_payment_invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing constraints to start fresh
ALTER TABLE crypto_payment_invoices DROP CONSTRAINT IF EXISTS crypto_payment_invoices_cryptocurrency_check;
ALTER TABLE crypto_payment_invoices DROP CONSTRAINT IF EXISTS crypto_payment_invoices_status_check;

-- Add cryptocurrency constraint with proper DO block syntax
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'crypto_payment_invoices_cryptocurrency_check'
    ) THEN
        EXECUTE 'ALTER TABLE crypto_payment_invoices
                 ADD CONSTRAINT crypto_payment_invoices_cryptocurrency_check
                 CHECK (cryptocurrency IN (''BTC'', ''ETH'', ''USDT'', ''SOL''))';
    END IF;
END$$;

-- Add status constraint with proper DO block syntax
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'crypto_payment_invoices_status_check'
    ) THEN
        EXECUTE 'ALTER TABLE crypto_payment_invoices
                 ADD CONSTRAINT crypto_payment_invoices_status_check
                 CHECK (status IN (''pending'', ''partial'', ''confirmed'', ''expired'', ''failed''))';
    END IF;
END$$;

-- Add missing INSERT policy for crypto payment invoices
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'crypto_payment_invoices'
        AND policyname = 'Users can insert own crypto invoices'
        AND cmd = 'INSERT'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can insert own crypto invoices"
                 ON crypto_payment_invoices
                 FOR INSERT
                 TO authenticated
                 WITH CHECK (auth.uid() = user_id)';
    END IF;
END$$;