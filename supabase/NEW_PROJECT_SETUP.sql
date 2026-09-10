-- ============================================================================
--  Osita David — full schema setup for a fresh Supabase project
-- ============================================================================
--  Run this ONCE in the new project's SQL Editor (Dashboard -> SQL -> New
--  query) BEFORE loading any data. It is the consolidated end state of
--  supabase/schema.sql + supabase/admin-dashboard.sql + every migration
--  0001-0018, plus the two objects that were only ever created by hand in
--  the old dashboard and never had a migration file: the `admins` table and
--  the `digital-downloads` storage bucket.
--
--  Safe to re-run (everything is IF NOT EXISTS / ON CONFLICT / OR REPLACE /
--  DROP-then-CREATE for policies).
--
--  AFTER this: load NEW_PROJECT_DATA.sql (auth users + all table rows), then
--  copy the storage files bucket-to-bucket (see the notes at the bottom).
-- ============================================================================


-- ----------------------------------------------------------------------------
--  admins  (staff access — separate from the customer profiles table)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own admin row" ON admins;
CREATE POLICY "Users can read own admin row"
  ON admins FOR SELECT
  USING (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
--  profiles  (extends auth.users; one row auto-created per signup)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT,
  full_name         TEXT,
  account_type      TEXT NOT NULL DEFAULT 'regular',
  stripe_customer_id TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_account_type_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_account_type_check
  CHECK (account_type IN ('regular', 'exclusive', 'admin'));

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user is created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, account_type)
  VALUES (NEW.id, NEW.email, 'regular')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ----------------------------------------------------------------------------
--  products
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS products_sort_order_seq;

CREATE TABLE IF NOT EXISTS products (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL,
  price                NUMERIC(10, 2),               -- nullable (migration 0013)
  image                TEXT NOT NULL,
  category             TEXT,
  description          TEXT,
  is_exclusive         BOOLEAN NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  printful_id          BIGINT,
  printful_variant_id  BIGINT,
  printful_variants    TEXT,
  external_checkout_url TEXT,                         -- migration 0012
  sort_order           INTEGER NOT NULL DEFAULT nextval('products_sort_order_seq'), -- 0014
  collection           TEXT,                          -- migration 0016
  back_image           TEXT                           -- migration 0018
);

CREATE UNIQUE INDEX IF NOT EXISTS products_printful_id_idx
  ON products (printful_id)
  WHERE printful_id IS NOT NULL;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read non-exclusive products" ON products;
CREATE POLICY "Anyone can read non-exclusive products"
  ON products FOR SELECT
  USING (is_exclusive = false);

DROP POLICY IF EXISTS "Exclusive users can read all products" ON products;
CREATE POLICY "Exclusive users can read all products"
  ON products FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.account_type = 'exclusive')
  );

-- NOTE: the original schema checked profiles.account_type = 'admin', but the
-- app moved admin status into the `admins` table. Using that here so the
-- policy is actually reachable (the app also does privileged product writes
-- through the service-role key, which bypasses RLS entirely regardless).
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING     (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));


-- ----------------------------------------------------------------------------
--  orders + order_items
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_session_id TEXT UNIQUE,
  total             NUMERIC(10, 2) NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own orders" ON orders;
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  price        NUMERIC(10, 2) NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own order items" ON order_items;
CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
              AND orders.user_id = auth.uid())
  );


-- ----------------------------------------------------------------------------
--  unreleased_albums  (must exist before unreleased_media — FK dependency)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS unreleased_albums (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE unreleased_albums ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read albums" ON unreleased_albums;
CREATE POLICY "Anyone can read albums"
  ON unreleased_albums FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage albums" ON unreleased_albums;
CREATE POLICY "Admins can manage albums"
  ON unreleased_albums FOR ALL
  USING     (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));


-- ----------------------------------------------------------------------------
--  unreleased_media
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS unreleased_media_sort_order_seq;

CREATE TABLE IF NOT EXISTS unreleased_media (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  media_type       TEXT NOT NULL,
  description      TEXT,
  cover_image      TEXT,
  file_path        TEXT,                 -- nullable (migration 0010)
  youtube_url      TEXT,                 -- migration 0010
  duration_seconds INTEGER,
  play_count       BIGINT NOT NULL DEFAULT 0,          -- migration 0004
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  album_id         UUID REFERENCES unreleased_albums(id) ON DELETE SET NULL, -- 0006
  track_number     INTEGER,                            -- migration 0006
  sort_order       INTEGER NOT NULL DEFAULT nextval('unreleased_media_sort_order_seq'), -- 0015
  price            NUMERIC                             -- migration 0017
);

ALTER TABLE unreleased_media DROP CONSTRAINT IF EXISTS unreleased_media_media_type_check;
ALTER TABLE unreleased_media
  ADD CONSTRAINT unreleased_media_media_type_check
  CHECK (media_type IN ('audio', 'video', 'image'));

ALTER TABLE unreleased_media DROP CONSTRAINT IF EXISTS unreleased_media_source_check;
ALTER TABLE unreleased_media
  ADD CONSTRAINT unreleased_media_source_check
  CHECK (
    (file_path IS NOT NULL AND youtube_url IS NULL)
    OR (file_path IS NULL AND youtube_url IS NOT NULL AND media_type = 'video')
  );

ALTER TABLE unreleased_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read unreleased media" ON unreleased_media;
DROP POLICY IF EXISTS "Exclusive users can read unreleased media" ON unreleased_media;
CREATE POLICY "Exclusive users can read unreleased media"
  ON unreleased_media FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.account_type = 'exclusive')
  );

DROP POLICY IF EXISTS "Admins can manage unreleased media" ON unreleased_media;
CREATE POLICY "Admins can manage unreleased media"
  ON unreleased_media FOR ALL
  USING     (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- Atomic public play-count increment (SECURITY DEFINER — anonymous visitors
-- bump this without any write grant on the table).
CREATE OR REPLACE FUNCTION increment_unreleased_play_count(media_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE unreleased_media SET play_count = play_count + 1 WHERE id = media_id;
$$;

GRANT EXECUTE ON FUNCTION increment_unreleased_play_count(UUID) TO anon, authenticated;


-- ----------------------------------------------------------------------------
--  events
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  event_date  DATE NOT NULL,
  event_time  TEXT,
  location    TEXT,
  cover_image TEXT,
  ticket_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Exclusive users can read events" ON events;
CREATE POLICY "Exclusive users can read events"
  ON events FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.account_type = 'exclusive')
  );

DROP POLICY IF EXISTS "Admins can manage events" ON events;
CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING     (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));


-- ----------------------------------------------------------------------------
--  storage buckets
-- ----------------------------------------------------------------------------
--  Public buckets are read directly via <img src>. Private buckets are only
--  ever read through short-lived signed URLs the server generates with the
--  service-role key, so they need no storage.objects RLS policies for this
--  app to work — every privileged storage operation goes through that key.
INSERT INTO storage.buckets (id, name, public, file_size_limit) VALUES
  ('unreleased-media',  'unreleased-media',  false, 2147483648),
  ('unreleased-covers', 'unreleased-covers', true,  2147483648),
  ('product-images',    'product-images',    true,  2147483648),
  ('event-covers',      'event-covers',      true,  2147483648),
  ('digital-downloads', 'digital-downloads', false, 2147483648)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit;

-- ============================================================================
--  AFTER running this file:
--
--  1. Load NEW_PROJECT_DATA.sql  (auth users first, then every table's rows,
--     then the two setval() calls to advance the sort_order sequences).
--
--  2. Copy the storage files from the old project's buckets into the new
--     project's (same bucket names). The storage.objects rows come across in
--     the data file, but the actual bytes do not — use rclone against both
--     projects' S3-compatible endpoints (Dashboard -> Settings -> Storage ->
--     S3 connection), or a script with both service-role keys.
--
--  3. New project Dashboard -> Authentication -> URL Configuration:
--     set Site URL + Redirect URLs to the deployed domain (and
--     http://localhost:3000 for local dev).
--
--  4. New project Dashboard -> Authentication -> Providers -> Email:
--     match the old project's "Confirm email" setting.
--
--  5. Dashboard -> Project Settings -> Storage -> "Upload file size limit":
--     raise it (a bucket limit can't exceed the project-wide one).
--
--  6. Update NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY /
--     SUPABASE_SERVICE_ROLE_KEY in Vercel (Project -> Settings -> Environment
--     Variables) to the new project's values, then redeploy.
-- ============================================================================
