@@ .. @@
 ALTER TABLE crypto_payment_invoices ENABLE ROW LEVEL SECURITY;
 
+-- Drop existing policies to ensure idempotent migration
+DROP POLICY IF EXISTS "Users can insert own crypto invoices" ON crypto_payment_invoices;
+DROP POLICY IF EXISTS "Users can view own crypto invoices" ON crypto_payment_invoices;
+DROP POLICY IF EXISTS "System can update crypto invoices" ON crypto_payment_invoices;
+
+-- Create policies with idempotent approach
 CREATE POLICY "Users can insert own crypto invoices"
   ON crypto_payment_invoices
   FOR INSERT
   WITH CHECK (user_id = auth.uid());
 
 CREATE POLICY "Users can view own crypto invoices"
   ON crypto_payment_invoices
   FOR SELECT
   USING (user_id = auth.uid());
 
 CREATE POLICY "System can update crypto invoices"
   ON crypto_payment_invoices
   FOR UPDATE
   USING (true);