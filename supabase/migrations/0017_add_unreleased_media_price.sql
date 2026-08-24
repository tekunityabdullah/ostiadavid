-- Lets unreleased audio/video be sold through the same cart the rest of the
-- site uses. Null price means the item isn't for sale yet -- Add to Cart
-- stays hidden on the detail page until an admin sets one.
ALTER TABLE unreleased_media ADD COLUMN IF NOT EXISTS price NUMERIC;

-- Placeholder pricing per the client's request: every audio track gets a
-- generic $900 for now (to be replaced with real per-track prices by hand
-- later); the two named videos get their real launch prices.
UPDATE unreleased_media
SET price = 900
WHERE media_type = 'audio' AND price IS NULL;

UPDATE unreleased_media
SET price = 1500
WHERE media_type = 'video' AND title ILIKE 'XII';

UPDATE unreleased_media
SET price = 2000
WHERE media_type = 'video' AND title ILIKE 'BERSERK';
