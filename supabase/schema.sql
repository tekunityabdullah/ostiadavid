-- Osita David — Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query)

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  account_type TEXT NOT NULL DEFAULT 'regular' CHECK (account_type IN ('regular', 'exclusive')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, account_type)
  VALUES (NEW.id, NEW.email, 'regular');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  image TEXT NOT NULL,
  category TEXT,
  description TEXT,
  is_exclusive BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  printful_id BIGINT,
  printful_variant_id BIGINT,
  printful_variants TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS products_printful_id_idx
  ON products (printful_id)
  WHERE printful_id IS NOT NULL;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read non-exclusive products"
  ON products FOR SELECT
  USING (is_exclusive = false);

CREATE POLICY "Exclusive users can read all products"
  ON products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.account_type = 'exclusive'
    )
  );

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

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_session_id TEXT UNIQUE,
  total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Seed regular products (from existing storefront)
INSERT INTO products (name, price, image, category, description, is_exclusive) VALUES
  ('ROSEGRAVE XI DIGITAL', 5.00, 'https://cdn.shopify.com/s/files/1/0634/0706/3123/files/39B70675-C860-42EE-B86A-49EB32A15FD82_05b407d0-8bcb-4747-8507-d6cbf07798fb.jpg?v=1765430371', 'digital', 'Digital download — Rosegrave XI.', false),
  ('XII00 CROP TOP', 30.00, 'https://cdn.shopify.com/s/files/1/0634/0706/3123/files/all-over-print-crop-top-white-front-680ea8a4e6c90.png?v=1745791153', 'apparel', 'All-over print crop top.', false),
  ('YGR CROP HOODIE', 46.00, 'https://cdn.shopify.com/s/files/1/0634/0706/3123/files/womens-cropped-hoodie-black-front-680ea98c6e13d.png?v=1745791384', 'apparel', 'Cropped hoodie.', false),
  ('DGO JERSEY LONG SLEEVE', 45.50, 'https://cdn.shopify.com/s/files/1/0634/0706/3123/files/all-over-print-recycled-hockey-fan-jersey-white-front-680ea9d6dd391.png?v=1745791464', 'apparel', 'Recycled hockey fan jersey — long sleeve.', false),
  ('YGR HOODIE', 34.50, 'https://cdn.shopify.com/s/files/1/0634/0706/3123/files/unisex-heavy-blend-hoodie-black-front-680eab90098bb.png?v=1745791903', 'apparel', 'Unisex heavy blend hoodie.', false),
  ('YGR SWEATPANTS', 57.95, 'https://cdn.shopify.com/s/files/1/0634/0706/3123/files/unisex-fleece-sweatpants-black-front-680eac50c5237.png?v=1745792088', 'apparel', 'Unisex fleece sweatpants.', false),
  ('XII00 TAPE CROP TOP', 30.00, 'https://cdn.shopify.com/s/files/1/0634/0706/3123/files/all-over-print-crop-top-white-front-680ead114a6b7.png?v=1745792283', 'apparel', 'Tape crop top.', false),
  ('XIIVIXEN CROP TEE', 33.50, 'https://cdn.shopify.com/s/files/1/0634/0706/3123/files/all-over-print-crop-tee-white-front-680ead49acba0.png?v=1745792340', 'apparel', 'All-over print crop tee.', false),
  ('DGO JERSEY SHORT SLEEVE', 43.00, 'https://cdn.shopify.com/s/files/1/0634/0706/3123/files/all-over-print-recycled-unisex-sports-jersey-white-front-680eade8b0a2a.png?v=1745792503', 'apparel', 'Recycled sports jersey — short sleeve.', false),
  ('METAL PRINT WHITE GIRL', 63.00, 'https://cdn.shopify.com/s/files/1/0634/0706/3123/files/glossy-metal-print-_in_-white-12x12-front-69ed6e167ebe6.png?v=1777167900', 'accessories', '12x12 glossy metal print.', false),
  ('METAL PRINT BLACK GIRL', 63.00, 'https://cdn.shopify.com/s/files/1/0634/0706/3123/files/glossy-metal-print-_in_-white-12x12-front-69ed6e373e380.png?v=1777167932', 'accessories', '12x12 glossy metal print.', false),
  ('OSITA ALTERNATE COVER POSTER', 29.50, 'https://cdn.shopify.com/s/files/1/0634/0706/3123/files/enhanced-matte-paper-poster-_cm_-a1-_59.4x84.1-cm_-front-69575c9ae40d5.png?v=1767333023', 'accessories', 'Enhanced matte poster — A1 size.', false);

-- Seed exclusive drops (example)
INSERT INTO products (name, price, image, category, description, is_exclusive) VALUES
  ('EXCLUSIVE VAULT DROP I', 75.00, 'https://cdn.shopify.com/s/files/1/0634/0706/3123/files/39B70675-C860-42EE-B86A-49EB32A15FD82_05b407d0-8bcb-4747-8507-d6cbf07798fb.jpg?v=1765430371', 'exclusive', 'Members-only limited drop.', true),
  ('EXCLUSIVE VAULT DROP II', 85.00, 'https://cdn.shopify.com/s/files/1/0634/0706/3123/files/unisex-heavy-blend-hoodie-black-front-680eab90098bb.png?v=1745791903', 'exclusive', 'Members-only limited hoodie.', true);
