-- Public bucket for product photos uploaded from the admin panel, same
-- pattern as unreleased-covers — public since product images are just
-- rendered via <img src>, no signed URL needed.
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;
