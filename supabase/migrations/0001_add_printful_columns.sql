-- Adds the columns the Printful integration (lib/printful.ts, app/api/printful/*)
-- reads and writes on the products table. Run this in the Supabase SQL editor.

ALTER TABLE products ADD COLUMN IF NOT EXISTS printful_id BIGINT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS printful_variant_id BIGINT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS printful_variants TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS products_printful_id_idx
  ON products (printful_id)
  WHERE printful_id IS NOT NULL;
