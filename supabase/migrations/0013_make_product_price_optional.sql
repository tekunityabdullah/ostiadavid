-- Price is only meaningful for products we actually sell through our own
-- cart/checkout. A product with an external_checkout_url (see migration
-- 0012) may not need one shown at all — Elastic Stage (or whatever
-- platform) has its own price. NULL means "no price shown"; every existing
-- product keeps its current price unchanged.

ALTER TABLE products ALTER COLUMN price DROP NOT NULL;
