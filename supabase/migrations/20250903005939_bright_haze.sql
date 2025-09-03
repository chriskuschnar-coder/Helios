/*
  # Fix payments table RLS policies

  1. Security Updates
    - Drop and recreate INSERT policy for authenticated users
    - Drop and recreate SELECT policy for user isolation
    - Keep RLS enabled on payments table

  2. Changes
    - Safe INSERT policy: authenticated users can insert own payments
    - Safe SELECT policy: users can only view their own payment records
    - Uses bulletproof DROP IF EXISTS + CREATE pattern
*/

-- Ensure RLS is enabled
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- INSERT policy - authenticated users can insert their own payments
DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;

CREATE POLICY "Users can insert own payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- SELECT policy - users can only view their own payments
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

CREATE POLICY "Users can view own payments"
ON public.payments
FOR SELECT
TO authenticated
USING (user_id = auth.uid());