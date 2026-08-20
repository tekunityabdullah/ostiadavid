-- Lets the admin panel manually reorder products (move up/down) instead of
-- always showing newest-first. A sequence-backed DEFAULT means every new
-- product — whether added by hand or synced from Printful — automatically
-- lands at the end of the order without any application code needing to
-- compute it.

CREATE SEQUENCE IF NOT EXISTS products_sort_order_seq;

ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- Backfill existing rows in their current (created_at) order so nothing
-- ends up NULL/0 and jumps to the front.
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM products
  WHERE sort_order IS NULL
)
UPDATE products
SET sort_order = ranked.rn
FROM ranked
WHERE products.id = ranked.id;

-- Make sure the sequence continues on from the highest backfilled value,
-- so the next new product doesn't collide with an existing sort_order.
SELECT setval('products_sort_order_seq', COALESCE((SELECT MAX(sort_order) FROM products), 0) + 1, false);

ALTER TABLE products ALTER COLUMN sort_order SET DEFAULT nextval('products_sort_order_seq');
ALTER TABLE products ALTER COLUMN sort_order SET NOT NULL;
