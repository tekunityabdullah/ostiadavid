-- Adds "image" as a third Unreleased media type, alongside audio/video —
-- the Exclusive > Unreleased hub now has Videos / Music / Images tabs.
ALTER TABLE unreleased_media DROP CONSTRAINT IF EXISTS unreleased_media_media_type_check;

ALTER TABLE unreleased_media
  ADD CONSTRAINT unreleased_media_media_type_check
  CHECK (media_type IN ('audio', 'video', 'image'));
