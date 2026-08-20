-- Same manual-reorder capability as products (migration 0014), but for
-- unreleased audio/video/image. A sequence-backed DEFAULT means every new
-- upload automatically lands at the end of the order with no extra
-- application code needed.

CREATE SEQUENCE IF NOT EXISTS unreleased_media_sort_order_seq;

ALTER TABLE unreleased_media ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- Backfill existing rows in their current (created_at) order so nothing
-- ends up NULL/0 and jumps to the front.
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM unreleased_media
  WHERE sort_order IS NULL
)
UPDATE unreleased_media
SET sort_order = ranked.rn
FROM ranked
WHERE unreleased_media.id = ranked.id;

-- Make sure the sequence continues on from the highest backfilled value,
-- so the next new upload doesn't collide with an existing sort_order.
SELECT setval(
  'unreleased_media_sort_order_seq',
  COALESCE((SELECT MAX(sort_order) FROM unreleased_media), 0) + 1,
  false
);

ALTER TABLE unreleased_media ALTER COLUMN sort_order SET DEFAULT nextval('unreleased_media_sort_order_seq');
ALTER TABLE unreleased_media ALTER COLUMN sort_order SET NOT NULL;
