-- Admin product dashboard migration
-- Run this in Supabase SQL Editor for an existing database.

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_account_type_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_account_type_check
  CHECK (account_type IN ('regular', 'exclusive', 'admin'));

DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.account_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.account_type = 'admin'
    )
  );

-- Replace this email with your admin account email.
UPDATE profiles
SET account_type = 'admin'
WHERE email = 'admin@example.com';
