/*
  # Create User Signup Trigger

  1. Functions
    - `handle_auth_signup()` - Creates user record and account when someone signs up

  2. Triggers
    - Trigger on auth.users insert to create user record and account
*/

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_auth_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users table
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );

  -- Create account for the new user
  INSERT INTO public.accounts (user_id, balance, available_balance)
  VALUES (NEW.id, 0.00, 0.00);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user and account on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_auth_signup();