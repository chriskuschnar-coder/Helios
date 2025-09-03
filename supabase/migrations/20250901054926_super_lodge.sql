/*
  # Add signed documents table for hedge fund onboarding

  1. New Tables
    - `signed_documents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `document_id` (text, document identifier)
      - `document_title` (text, human readable title)
      - `document_type` (text, type of document)
      - `signature` (text, electronic signature)
      - `signed_at` (timestamp, when signed)
      - `ip_address` (text, for compliance)
      - `user_agent` (text, for compliance)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `signed_documents` table
    - Add policy for users to read their own signed documents
    - Add policy for users to insert their own signed documents

  3. Indexes
    - Index on user_id for fast lookups
    - Index on document_type for reporting
    - Index on signed_at for compliance queries
*/

CREATE TABLE IF NOT EXISTS signed_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  document_id text NOT NULL,
  document_title text NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('investment_agreement', 'risk_disclosure', 'accredited_investor', 'subscription_agreement', 'privacy_policy')),
  signature text NOT NULL,
  signed_at timestamptz NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE signed_documents ENABLE ROW LEVEL SECURITY;

-- Policies
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_signed_documents_user_id ON signed_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_signed_documents_type ON signed_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_signed_documents_signed_at ON signed_documents(signed_at);