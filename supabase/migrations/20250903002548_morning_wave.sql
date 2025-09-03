@@ .. @@
 ALTER TABLE crypto_payment_invoices ENABLE ROW LEVEL SECURITY;
 
 -- Add constraints with conditional creation
-ALTER TABLE crypto_payment_invoices
-DROP CONSTRAINT IF EXISTS crypto_payment_invoices_cryptocurrency_check;
-
-ALTER TABLE crypto_payment_invoices
-ADD CONSTRAINT crypto_payment_invoices_cryptocurrency_check
-CHECK (cryptocurrency = ANY (ARRAY['BTC'::text, 'ETH'::text, 'USDT'::text, 'SOL'::text]));
-
-ALTER TABLE crypto_payment_invoices
-DROP CONSTRAINT IF EXISTS crypto_payment_invoices_status_check;
-
-ALTER TABLE crypto_payment_invoices
-ADD CONSTRAINT crypto_payment_invoices_status_check
-CHECK (status = ANY (ARRAY['pending'::text, 'partial'::text, 'confirmed'::text, 'expired'::text, 'failed'::text]));
+DO $$
+BEGIN
+    IF NOT EXISTS (
+        SELECT 1
+        FROM pg_constraint
+        WHERE conname = 'crypto_payment_invoices_cryptocurrency_check'
+    ) THEN
+        ALTER TABLE crypto_payment_invoices
+        ADD CONSTRAINT crypto_payment_invoices_cryptocurrency_check
+        CHECK (cryptocurrency IN ('BTC', 'ETH', 'USDT', 'SOL'));
+    END IF;
+END$$;
+
+DO $$
+BEGIN
+    IF NOT EXISTS (
+        SELECT 1
+        FROM pg_constraint
+        WHERE conname = 'crypto_payment_invoices_status_check'
+    ) THEN
+        ALTER TABLE crypto_payment_invoices
+        ADD CONSTRAINT crypto_payment_invoices_status_check
+        CHECK (status IN ('pending', 'partial', 'confirmed', 'expired', 'failed'));
+    END IF;
+END$$;