-- Unreleased section — public in-site audio/video streaming library.

CREATE TABLE IF NOT EXISTS unreleased_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('audio', 'video')),
  description TEXT,
  cover_image TEXT,
  file_path TEXT NOT NULL,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE unreleased_media ENABLE ROW LEVEL SECURITY;

-- Unreleased is a fully public section — anyone (including signed-out
-- visitors) can list metadata. The actual media file is never exposed via a
-- public URL, only through short-lived signed URLs issued by
-- /api/unreleased/stream, so this open SELECT policy doesn't leak files.
CREATE POLICY "Anyone can read unreleased media"
  ON unreleased_media FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage unreleased media"
  ON unreleased_media FOR ALL
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

-- Private storage bucket holding the actual audio/video files. Not public —
-- files are only ever accessed through time-limited signed URLs.
INSERT INTO storage.buckets (id, name, public)
VALUES ('unreleased-media', 'unreleased-media', false)
ON CONFLICT (id) DO NOTHING;
