-- Play/view counts for the Unreleased library.

ALTER TABLE unreleased_media
  ADD COLUMN IF NOT EXISTS play_count BIGINT NOT NULL DEFAULT 0;

-- Atomic increment via RPC (not a client-side read-then-write) so
-- concurrent plays from different visitors don't clobber each other.
-- SECURITY DEFINER because the section is fully public — anonymous
-- visitors need to be able to bump this without write access to the table.
CREATE OR REPLACE FUNCTION increment_unreleased_play_count(media_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE unreleased_media SET play_count = play_count + 1 WHERE id = media_id;
$$;

GRANT EXECUTE ON FUNCTION increment_unreleased_play_count(UUID) TO anon, authenticated;
