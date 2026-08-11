-- None of the admin-managed storage buckets had an explicit file_size_limit
-- set, so each one silently fell back to this Supabase project's
-- project-wide default upload cap — which is what was actually rejecting
-- large (e.g. ~1GB) video uploads with a 500, even though the app itself
-- (next.config.ts: serverActions.bodySizeLimit / proxyClientMaxBodySize)
-- was already raised to 1000mb.
--
-- IMPORTANT: a bucket-level limit can never exceed the project's own global
-- Storage upload limit. After running this, also check/raise that in the
-- Supabase dashboard: Project Settings -> Storage -> "Upload file size
-- limit". If the global limit is still e.g. 50MB, this migration alone
-- won't fix large uploads.

UPDATE storage.buckets
SET file_size_limit = 2147483648 -- 2GB, in bytes
WHERE id IN (
  'unreleased-media',
  'unreleased-covers',
  'digital-downloads',
  'product-images',
  'event-covers'
);
