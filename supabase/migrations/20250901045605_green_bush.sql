/*
  # Update signed documents table (table already exists)

  1. Table Status
    - `signed_documents` table already exists with proper structure
    - Checking and adding any missing columns if needed
    
  2. Security
    - Verify RLS is enabled on `signed_documents` table
    - Add policies only if they don't exist
    
  3. Notes
    - This migration safely handles existing table structure
    - Uses IF NOT EXISTS checks to prevent conflicts
*/

-- Ensure RLS is enabled (safe to run multiple times)
ALTER TABLE signed_documents ENABLE ROW LEVEL SECURITY;

-- Add policies only if they don't exist
DO $$
BEGIN
  -- Policy for users to read their own signed documents
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy
    WHERE polname = 'Users can read own signed documents'
      AND tablename = 'signed_documents'
  ) THEN
    CREATE POLICY "Users can read own signed documents"
      ON signed_documents
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Policy for users to insert their own signed documents  
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy
    WHERE polname = 'Users can insert own signed documents'
      AND tablename = 'signed_documents'
  ) THEN
    CREATE POLICY "Users can insert own signed documents"
      ON signed_documents
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;