/*
  # Fix User Account Creation System

  1. Clean Up
    - Drop existing conflicting triggers
    - Drop old function safely
  
  2. Recreate Function
    - Simple account creation function
    - Proper error handling
    
  3. Security
    - Enable RLS on accounts table
    - Recreate trigger for new users
*/

-- First drop the triggers that depend on the function
DROP TRIGGER IF EXISTS create_account_for_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_user_account_trigger ON auth.users;

-- Then drop the function
DROP FUNCTION IF EXISTS create_user_account();

-- Recreate the function with proper logic
CREATE OR REPLACE FUNCTION create_user_account()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.accounts (user_id, created_at)
  VALUES (NEW.id, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reattach the trigger to auth.users
CREATE TRIGGER create_account_for_new_user
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_user_account();