@@ .. @@
 -- Add constraints with proper validation
-ALTER TABLE crypto_payment_invoices 
-ADD CONSTRAINT crypto_payment_invoices_cryptocurrency_check 
-CHECK (cryptocurrency = ANY (ARRAY['BTC'::text, 'ETH'::text, 'USDT'::text, 'SOL'::text]));
+-- Drop constraint first if it exists, then add it fresh (idempotent)
+ALTER TABLE crypto_payment_invoices
+DROP CONSTRAINT IF EXISTS crypto_payment_invoices_cryptocurrency_check;
+
+ALTER TABLE crypto_payment_invoices
+ADD CONSTRAINT crypto_payment_invoices_cryptocurrency_check
+CHECK (cryptocurrency IN ('BTC', 'ETH', 'USDT', 'SOL'));
 
-ALTER TABLE crypto_payment_invoices 
-ADD CONSTRAINT crypto_payment_invoices_status_check 
-CHECK (status = ANY (ARRAY['pending'::text, 'partial'::text, 'confirmed'::text, 'expired'::text, 'failed'::text]));
+-- Drop status constraint first if it exists, then add it fresh (idempotent)
+ALTER TABLE crypto_payment_invoices
+DROP CONSTRAINT IF EXISTS crypto_payment_invoices_status_check;
+
+ALTER TABLE crypto_payment_invoices
+ADD CONSTRAINT crypto_payment_invoices_status_check
+CHECK (status IN ('pending', 'partial', 'confirmed', 'expired', 'failed'));