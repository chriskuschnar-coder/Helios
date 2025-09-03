@@ .. @@
 -- 4. Add constraints with conditional checks
 
+-- Drop existing constraints first to ensure clean state
+ALTER TABLE crypto_payment_invoices
+DROP CONSTRAINT IF EXISTS crypto_payment_invoices_cryptocurrency_check;
+
+ALTER TABLE crypto_payment_invoices
+DROP CONSTRAINT IF EXISTS crypto_payment_invoices_status_check;
+
 -- Cryptocurrency constraint
 DO $$
 BEGIN