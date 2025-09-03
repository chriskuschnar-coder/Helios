@@ .. @@
 ALTER TABLE crypto_payment_invoices ENABLE ROW LEVEL SECURITY;
 
+-- Remove existing constraint if it exists
+ALTER TABLE crypto_payment_invoices
+DROP CONSTRAINT IF EXISTS crypto_payment_invoices_cryptocurrency_check;
+
 -- Add cryptocurrency constraint with conditional check
 DO $$
 BEGIN