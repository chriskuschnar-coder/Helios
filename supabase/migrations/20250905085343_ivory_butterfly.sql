@@ .. @@
 CREATE POLICY "Users can view own compliance records"
   ON compliance_records
   FOR SELECT
   TO public
-  USING (uid() = user_id);
+  USING (auth.uid() = user_id);
 
 -- Users table policies
 CREATE POLICY "System can insert users"
@@ .. @@
 CREATE POLICY "Users can update own data"
   ON users
   FOR UPDATE
   TO authenticated
-  USING (uid() = id);
+  USING (auth.uid() = id);
 
 CREATE POLICY "Users can update own document status"
   ON users
   FOR UPDATE
   TO authenticated
-  USING (uid() = id)
-  WITH CHECK (uid() = id);
+  USING (auth.uid() = id)
+  WITH CHECK (auth.uid() = id);
 
 CREATE POLICY "Users can view own data"
   ON users
   FOR SELECT
   TO public
-  USING (uid() = id);
+  USING (auth.uid() = id);
 
 -- Crypto addresses policies
 CREATE POLICY "Users can view own crypto addresses"
   ON crypto_addresses
   FOR SELECT
   TO public
-  USING (uid() = user_id);
+  USING (auth.uid() = user_id);
 
 -- Bank accounts policies
 CREATE POLICY "Users can view own bank accounts"
   ON bank_accounts
   FOR SELECT
   TO public
-  USING (uid() = user_id);
+  USING (auth.uid() = user_id);
 
 -- Wire instructions policies
 CREATE POLICY "Users can view own wire instructions"
   ON wire_instructions
   FOR SELECT
   TO public
-  USING (uid() = user_id);
+  USING (auth.uid() = user_id);
 
 -- Signed documents policies
 CREATE POLICY "Users can insert own signed documents"
   ON signed_documents
   FOR INSERT
   TO authenticated
-  WITH CHECK (uid() = user_id);
+  WITH CHECK (auth.uid() = user_id);
 
 CREATE POLICY "Users can read own signed documents"
   ON signed_documents
   FOR SELECT
   TO authenticated
-  USING (uid() = user_id);
+  USING (auth.uid() = user_id);
 
 CREATE POLICY "Users can update own signed documents"
   ON signed_documents
   FOR UPDATE
   TO authenticated
-  USING (uid() = user_id)
-  WITH CHECK (uid() = user_id);
+  USING (auth.uid() = user_id)
+  WITH CHECK (auth.uid() = user_id);
 
 -- Profiles policies
 CREATE POLICY "Users can insert their own profile"
   ON profiles
   FOR INSERT
   TO public
-  WITH CHECK (uid() = id);
+  WITH CHECK (auth.uid() = id);
 
 CREATE POLICY "Users can update their own profile"
   ON profiles
   FOR UPDATE
   TO public
-  USING (uid() = id);
+  USING (auth.uid() = id);
 
 CREATE POLICY "Users can view own profile"
   ON profiles
   FOR SELECT
   TO public
-  USING (uid() = id);
+  USING (auth.uid() = id);
 
 CREATE POLICY "Users can view their own profile"
   ON profiles
   FOR SELECT
   TO public
-  USING (uid() = id);
+  USING (auth.uid() = id);
 
 -- Onboarding policies
 CREATE POLICY "Users can delete own onboarding"
   ON onboarding
   FOR DELETE
   TO public
-  USING (uid() = user_id);
+  USING (auth.uid() = user_id);
 
 CREATE POLICY "Users can insert own onboarding"
   ON onboarding
   FOR INSERT
   TO public
-  WITH CHECK (uid() = user_id);
+  WITH CHECK (auth.uid() = user_id);
 
 CREATE POLICY "Users can read own onboarding"
   ON onboarding
   FOR SELECT
   TO public
-  USING (uid() = user_id);
+  USING (auth.uid() = user_id);
 
 CREATE POLICY "Users can update own onboarding"
   ON onboarding
   FOR UPDATE
   TO public
-  USING (uid() = user_id)
-  WITH CHECK (uid() = user_id);
+  USING (auth.uid() = user_id)
+  WITH CHECK (auth.uid() = user_id);
 
 -- Crypto payment invoices policies
 CREATE POLICY "Users can insert own crypto invoices"
   ON crypto_payment_invoices
   FOR INSERT
   TO public
-  WITH CHECK (uid() = user_id);
+  WITH CHECK (auth.uid() = user_id);
 
 CREATE POLICY "Users can view own crypto invoices"
   ON crypto_payment_invoices
   FOR SELECT
   TO public
-  USING (uid() = user_id);
+  USING (auth.uid() = user_id);
 
 CREATE POLICY "Users can view own invoices"
   ON crypto_payment_invoices
   FOR SELECT
   TO public
-  USING (uid() = user_id);
+  USING (auth.uid() = user_id);
 
 -- Payments policies
 CREATE POLICY "Users can insert own payments"
   ON payments
   FOR INSERT
   TO authenticated
-  WITH CHECK (uid() = user_id);
+  WITH CHECK (auth.uid() = user_id);
 
 CREATE POLICY "Users can view own payments"
   ON payments
   FOR SELECT
   TO authenticated
-  USING (uid() = user_id);
+  USING (auth.uid() = user_id);
 
 -- Accounts policies
 CREATE POLICY "Users can update own accounts"
   ON accounts
   FOR UPDATE
   TO authenticated
-  USING (uid() = user_id);
+  USING (auth.uid() = user_id);
 
 CREATE POLICY "Users can view own accounts"
   ON accounts
   FOR SELECT
   TO authenticated
-  USING (uid() = user_id);
+  USING (auth.uid() = user_id);
 
 -- Transactions policies
 CREATE POLICY "Users can insert own transactions"
   ON transactions
   FOR INSERT
   TO authenticated
-  WITH CHECK (uid() = user_id);
+  WITH CHECK (auth.uid() = user_id);
 
 CREATE POLICY "Users can view own transactions"
   ON transactions
   FOR SELECT
   TO public
-  USING (uid() = user_id);
+  USING (auth.uid() = user_id);
 
 -- Fund transactions policies
 CREATE POLICY "Users can insert own fund transactions"
   ON fund_transactions
   FOR INSERT
   TO authenticated
-  WITH CHECK (uid() = user_id);
+  WITH CHECK (auth.uid() = user_id);
 
 CREATE POLICY "Users can read own fund transactions"
   ON fund_transactions
   FOR SELECT
   TO authenticated
-  USING (uid() = user_id);
+  USING (auth.uid() = user_id);
 
 -- Investor units policies
 CREATE POLICY "Users can read own unit holdings"
   ON investor_units
   FOR SELECT
   TO authenticated
-  USING (uid() = user_id);
+  USING (auth.uid() = user_id);
 
 CREATE POLICY "Users can view own investor_units"
   ON investor_units
   FOR SELECT
   TO public
-  USING (user_id = uid());
+  USING (user_id = auth.uid());
 
 -- Fund NAV policies
 CREATE POLICY "Users can read fund NAV data"