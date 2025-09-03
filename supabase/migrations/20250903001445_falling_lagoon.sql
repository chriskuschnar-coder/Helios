@@ .. @@
 ALTER TABLE crypto_payment_invoices ENABLE ROW LEVEL SECURITY;

-CREATE POLICY "Users can insert own crypto invoices"
+CREATE POLICY IF NOT EXISTS "Users can insert own crypto invoices"
   ON crypto_payment_invoices
   FOR INSERT
   WITH CHECK (user_id = auth.uid());

-CREATE POLICY "Users can view own crypto invoices"
+CREATE POLICY IF NOT EXISTS "Users can view own crypto invoices"
   ON crypto_payment_invoices
   FOR SELECT
   USING (user_id = auth.uid());

-CREATE POLICY "System can update crypto invoices"
+CREATE POLICY IF NOT EXISTS "System can update crypto invoices"
   ON crypto_payment_invoices
   FOR UPDATE
   USING (true);