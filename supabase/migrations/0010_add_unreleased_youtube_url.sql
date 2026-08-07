-- Lets admins add a video entry that's just a YouTube link (embedded via
-- iframe on the site) instead of an uploaded file. file_path becomes
-- optional; a row must have exactly one of file_path / youtube_url, and
-- youtube_url is only valid on 'video' rows.

ALTER TABLE unreleased_media ADD COLUMN IF NOT EXISTS youtube_url TEXT;

ALTER TABLE unreleased_media ALTER COLUMN file_path DROP NOT NULL;

ALTER TABLE unreleased_media DROP CONSTRAINT IF EXISTS unreleased_media_source_check;

ALTER TABLE unreleased_media
  ADD CONSTRAINT unreleased_media_source_check
  CHECK (
    (file_path IS NOT NULL AND youtube_url IS NULL)
    OR (file_path IS NULL AND youtube_url IS NOT NULL AND media_type = 'video')
  );
