@@ .. @@
 CREATE POLICY "Users can view own investor_units"
   ON investor_units
   FOR SELECT
-  USING (user_id = uid());
+  USING (user_id = auth.uid());

 CREATE POLICY "Service role can manage all unit holdings"
   ON investor_units
   FOR ALL
   TO service_role
   USING (true)
   WITH CHECK (true);