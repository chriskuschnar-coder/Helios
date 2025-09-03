@@ .. @@
 -- Add constraints with proper drop-first approach
 ALTER TABLE crypto_payment_invoices
-ADD CONSTRAINT IF NOT EXISTS crypto_payment_invoices_cryptocurrency_check
+DROP CONSTRAINT IF EXISTS crypto_payment_invoices_cryptocurrency_check;
+
+ALTER TABLE crypto_payment_invoices
+ADD CONSTRAINT crypto_payment_invoices_cryptocurrency_check
 CHECK (cryptocurrency IN ('BTC', 'ETH', 'USDT', 'SOL'));
 
 ALTER TABLE crypto_payment_invoices
-ADD CONSTRAINT IF NOT EXISTS crypto_payment_invoices_status_check
+DROP CONSTRAINT IF EXISTS crypto_payment_invoices_status_check;
+
+ALTER TABLE crypto_payment_invoices
+ADD CONSTRAINT crypto_payment_invoices_status_check
 CHECK (status IN ('pending', 'partial', 'confirmed', 'expired', 'failed'));