/*
  # Create onboarding table for hedge fund document signing

  1. New Tables
    - `onboarding`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `document_id` (text, document identifier)
      - `document_title` (text, document name)
      - `document_type` (text, type of document)
      - `signature` (text, electronic signature)
      - `signed_at` (timestamp, when signed)
      - `ip_address` (text, signing IP)
      - `user_agent` (text, browser info)
      - `created_at` (timestamp, record creation)

  2. Security
    - Enable RLS on `onboarding` table
    - Add policy for users to insert their own onboarding records
    - Add policy for users to read their own onboarding records

  3. Constraints
    - Document type must be one of: investment_agreement, risk_disclosure, accredited_investor
*/

-- Create onboarding table
CREATE TABLE IF NOT EXISTS onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  document_id text NOT NULL,
  document_title text NOT NULL,
  document_type text NOT NULL,
  signature text NOT NULL,
  signed_at timestamptz NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE onboarding ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_signed_at ON onboarding(signed_at);
CREATE INDEX IF NOT EXISTS idx_onboarding_type ON onboarding(document_type);

-- Add constraint for document types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'onboarding_document_type_check' 
    AND table_name = 'onboarding'
  ) THEN
    ALTER TABLE onboarding ADD CONSTRAINT onboarding_document_type_check 
    CHECK (document_type IN ('investment_agreement', 'risk_disclosure', 'accredited_investor', 'subscription_agreement', 'privacy_policy'));
  END IF;
END $$;

-- Create policies only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Users can insert own onboarding records'
    AND tablename = 'onboarding'
  ) THEN
    CREATE POLICY "Users can insert own onboarding records"
      ON onboarding
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Users can read own onboarding records'
    AND tablename = 'onboarding'
  ) THEN
    CREATE POLICY "Users can read own onboarding records"
      ON onboarding
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;