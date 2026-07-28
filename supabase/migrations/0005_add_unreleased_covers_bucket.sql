-- Public bucket for cover art uploaded from the admin panel. Public (unlike
-- unreleased-media/digital-downloads) because cover images are meant to be
-- shown directly via <img src>, not gated behind a signed URL.
INSERT INTO storage.buckets (id, name, public)
VALUES ('unreleased-covers', 'unreleased-covers', true)
ON CONFLICT (id) DO NOTHING;
