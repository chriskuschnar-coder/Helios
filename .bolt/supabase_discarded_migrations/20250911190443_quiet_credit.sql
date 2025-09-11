/*
  # Add Subscription Agreement Fields

  1. Schema Updates
    - Add `subscription_signed_at` to users table
    - Add `subscription_signed_url` to users table
    - Update signed_documents table to support subscription agreements

  2. Security
    - Maintain existing RLS policies
    - Ensure only users can access their own subscription data

  3. Storage
    - Prepare for signed document storage in Supabase Storage
*/

-- Add subscription agreement fields to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'subscription_signed_at'
  ) THEN
    ALTER TABLE users ADD COLUMN subscription_signed_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'subscription_signed_url'
  ) THEN
    ALTER TABLE users ADD COLUMN subscription_signed_url text;
  END IF;
END $$;

-- Create index for subscription agreement queries
CREATE INDEX IF NOT EXISTS idx_users_subscription_signed 
ON users (subscription_signed_at) 
WHERE subscription_signed_at IS NOT NULL;

-- Update signed_documents table to ensure subscription_agreement is supported
DO $$
BEGIN
  -- Check if subscription_agreement is already in the constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'signed_documents_document_type_check' 
    AND check_clause LIKE '%subscription_agreement%'
  ) THEN
    -- Drop the existing constraint
    ALTER TABLE signed_documents DROP CONSTRAINT IF EXISTS signed_documents_document_type_check;
    
    -- Add the updated constraint with subscription_agreement
    ALTER TABLE signed_documents ADD CONSTRAINT signed_documents_document_type_check 
    CHECK ((document_type = ANY (ARRAY[
      'investment_agreement'::text, 
      'risk_disclosure'::text, 
      'accredited_investor'::text, 
      'subscription_agreement'::text, 
      'privacy_policy'::text
    ])));
  END IF;
END $$;

-- Create storage bucket for agreements if it doesn't exist (this will be handled by Supabase admin)
-- The bucket 'documents' should already exist and be configured for authenticated access

-- Add RLS policy for subscription agreement access
CREATE POLICY IF NOT EXISTS "Users can view own subscription agreement URL"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);