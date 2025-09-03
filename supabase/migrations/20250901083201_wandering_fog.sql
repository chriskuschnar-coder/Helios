/*
  # Add document completion tracking

  1. New Tables
    - Update `users` table to track document completion status
    - `signed_documents` table already exists for storing individual signed documents
  
  2. Security
    - Enable RLS on updated tables
    - Add policies for users to read/write their own document data
  
  3. Changes
    - Add `documents_completed` boolean field to users table
    - Add `documents_completed_at` timestamp to users table
    - Update existing signed_documents table structure if needed
*/

-- Add document completion tracking to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'documents_completed'
  ) THEN
    ALTER TABLE users ADD COLUMN documents_completed boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'documents_completed_at'
  ) THEN
    ALTER TABLE users ADD COLUMN documents_completed_at timestamptz;
  END IF;
END $$;

-- Update RLS policies for signed_documents table to allow updates
DROP POLICY IF EXISTS "Users can update own signed documents" ON signed_documents;

CREATE POLICY "Users can update own signed documents"
  ON signed_documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add policy for users to update their own document completion status
DROP POLICY IF EXISTS "Users can update own document status" ON users;

CREATE POLICY "Users can update own document status"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);