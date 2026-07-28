-- Albums — artist-curated groupings of tracks (distinct from user-side
-- localStorage playlists). Audio only, matching how real music albums work.

CREATE TABLE IF NOT EXISTS unreleased_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE unreleased_albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read albums"
  ON unreleased_albums FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage albums"
  ON unreleased_albums FOR ALL
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

ALTER TABLE unreleased_media
  ADD COLUMN IF NOT EXISTS album_id UUID REFERENCES unreleased_albums(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS track_number INTEGER;
