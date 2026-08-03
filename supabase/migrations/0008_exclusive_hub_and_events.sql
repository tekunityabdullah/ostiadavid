-- Unreleased moves back behind the Exclusive page (as a tab) instead of
-- being a standalone public section — revert the earlier public policy.
-- Dropping both possible names defensively: depending on when this project
-- last ran the Unreleased migrations, the DB may still have the original
-- exclusive-only policy (never actually swapped to the public one) or the
-- public one — either way, start clean before recreating it.
DROP POLICY IF EXISTS "Anyone can read unreleased media" ON unreleased_media;
DROP POLICY IF EXISTS "Exclusive users can read unreleased media" ON unreleased_media;

CREATE POLICY "Exclusive users can read unreleased media"
  ON unreleased_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.account_type = 'exclusive'
    )
  );

-- Events — a new tab alongside Clothes/Unreleased inside the Exclusive
-- page, admin-managed, split into Past/Upcoming by event_date.
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TEXT,
  location TEXT,
  cover_image TEXT,
  ticket_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exclusive users can read events"
  ON events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.account_type = 'exclusive'
    )
  );

CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Public bucket for event cover images uploaded from the admin panel, same
-- pattern as unreleased-covers/product-images.
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-covers', 'event-covers', true)
ON CONFLICT (id) DO NOTHING;
