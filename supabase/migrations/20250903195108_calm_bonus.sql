@@ .. @@
 ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
 
 CREATE POLICY "System can insert accounts"
   ON accounts
   FOR INSERT
   TO authenticated
   WITH CHECK (true);
 
 CREATE POLICY "Users can update own accounts"
   ON accounts
   FOR UPDATE
   TO authenticated
   USING (auth.uid() = user_id);
 
-DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
-CREATE POLICY "Users can view own accounts"
-  ON accounts
-  FOR SELECT
-  TO authenticated
-  USING (auth.uid() = user_id);
-
 -- Transactions table
 CREATE TABLE IF NOT EXISTS transactions (