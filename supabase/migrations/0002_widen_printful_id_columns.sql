-- Printful sync_variant/sync_product ids can exceed Postgres INTEGER range
-- (e.g. sync_variant id 5378003618 > 2^31-1). Widen to BIGINT.

ALTER TABLE products ALTER COLUMN printful_id TYPE BIGINT;
ALTER TABLE products ALTER COLUMN printful_variant_id TYPE BIGINT;
