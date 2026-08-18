-- Some products (e.g. vinyl/CD releases sold through Elastic Stage, which
-- has no API to integrate with) aren't checked out through our own
-- cart/Stripe flow at all — the product page just redirects out to an
-- external checkout URL instead. NULL means "sold normally through us",
-- same as every existing product.

ALTER TABLE products ADD COLUMN IF NOT EXISTS external_checkout_url TEXT;
