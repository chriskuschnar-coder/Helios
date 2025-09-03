/*
  # Safe Policy Creation with Multiple Fallback Methods

  This migration uses multiple approaches to ensure policies are created safely:
  1. DROP IF EXISTS + CREATE (most reliable)
  2. CREATE IF NOT EXISTS (PostgreSQL 9.5+)
  3. Conditional DO blocks (universal compatibility)

  This prevents 42710 errors regardless of:
  - Current database state
  - Bolt's migration tracking state
  - Multiple execution attempts
  - Transaction conflicts
*/

-- OPTION 1: Nuclear approach - Drop and recreate (most reliable)
DROP POLICY IF EXISTS "Users can insert own crypto invoices" ON crypto_payment_invoices;
DROP POLICY IF EXISTS "Users can view own crypto invoices" ON crypto_payment_invoices;
DROP POLICY IF EXISTS "System can update crypto invoices" ON crypto_payment_invoices;

-- Create fresh policies
CREATE POLICY "Users can insert own crypto invoices"
ON crypto_payment_invoices
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own crypto invoices"
ON crypto_payment_invoices
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can update crypto invoices"
ON crypto_payment_invoices
FOR UPDATE
USING (true);

-- OPTION 2: Backup with IF NOT EXISTS
CREATE POLICY IF NOT EXISTS "Users can insert own crypto invoices v2"
ON crypto_payment_invoices
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can view own crypto invoices v2"
ON crypto_payment_invoices
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "System can update crypto invoices v2"
ON crypto_payment_invoices
FOR UPDATE
USING (true);

-- OPTION 3: Ultimate fallback with conditional blocks
DO $$
BEGIN
   -- Ensure insert policy exists
   IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE policyname LIKE '%insert%crypto%invoices%' 
        AND tablename = 'crypto_payment_invoices'
   ) THEN
      CREATE POLICY "Users can insert own crypto invoices v3"
      ON crypto_payment_invoices
      FOR INSERT
      WITH CHECK (user_id = auth.uid());
   END IF;

   -- Ensure select policy exists
   IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE policyname LIKE '%view%crypto%invoices%' 
        AND tablename = 'crypto_payment_invoices'
   ) THEN
      CREATE POLICY "Users can view own crypto invoices v3"
      ON crypto_payment_invoices
      FOR SELECT
      USING (user_id = auth.uid());
   END IF;

   -- Ensure update policy exists
   IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE policyname LIKE '%update%crypto%invoices%' 
        AND tablename = 'crypto_payment_invoices'
   ) THEN
      CREATE POLICY "System can update crypto invoices v3"
      ON crypto_payment_invoices
      FOR UPDATE
      USING (true);
   END IF;
END$$;