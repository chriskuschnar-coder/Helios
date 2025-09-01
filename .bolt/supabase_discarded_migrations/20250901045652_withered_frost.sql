/*
  # Create onboarding documents table

  1. New Tables
    - `onboarding_documents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `document_id` (text, document identifier)
      - `document_title` (text, human readable title)
      - `document_type` (text, document category)
      - `signature` (text, electronic signature)
      - `signed_at` (timestamp, when signed)
      - `ip_address` (text, optional IP tracking)
      - `user_agent` (text, optional browser info)
      - `created_at` (timestamp, record creation)

  2. Security
    - Enable RLS on `onboarding_documents` table
    - Add policy for users to insert their own documents
    - Add policy for users to read their own documents

  3. Constraints
    - Document type must be one of: investment_agreement, risk_disclosure, accredited_investor, subscription_agreement, privacy_policy
*/

-- Create onboarding_documents table
CREATE TABLE IF NOT EXISTS onboarding_documents (
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
ALTER TABLE onboarding_documents ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy
    WHERE polname = 'Users can insert own onboarding documents'
      AND tablename = 'onboarding_documents'
  ) THEN
    CREATE POLICY "Users can insert own onboarding documents"
      ON onboarding_documents
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy
    WHERE polname = 'Users can read own onboarding documents'
      AND tablename = 'onboarding_documents'
  ) THEN
    CREATE POLICY "Users can read own onboarding documents"
      ON onboarding_documents
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Add constraint for document types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'onboarding_documents_document_type_check'
      AND table_name = 'onboarding_documents'
  ) THEN
    ALTER TABLE onboarding_documents
    ADD CONSTRAINT onboarding_documents_document_type_check
    CHECK (document_type IN ('investment_agreement', 'risk_disclosure', 'accredited_investor', 'subscription_agreement', 'privacy_policy'));
  END IF;
END
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_onboarding_documents_user_id ON onboarding_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_documents_type ON onboarding_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_onboarding_documents_signed_at ON onboarding_documents(signed_at);