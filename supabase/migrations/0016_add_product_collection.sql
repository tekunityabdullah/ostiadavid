-- Adds a free-text "collection" grouping to products. Null/empty means the
-- product does not appear on the Collections page at all -- only products
-- an admin has explicitly assigned to a collection show there, grouped by
-- collection name.
ALTER TABLE products ADD COLUMN IF NOT EXISTS collection TEXT;

-- Seeds the initial "Self Titled" collection with the products the client
-- listed. Matched case-insensitively by name; the vinyl entry is matched
-- loosely since it may have been saved with the "12"" in the name.
UPDATE products
SET collection = 'Self Titled'
WHERE (
  name ILIKE 'OSITA CD ALBUM'
  OR name ILIKE '%VINYL ALBUM%'
  OR name ILIKE 'FUCK BOII CROP TOP'
  OR name ILIKE 'BIKER BOII CROP HOODIE'
  OR name ILIKE 'FUCK BOII HOODIE'
  OR name ILIKE 'BIKER BOII HOODIE'
  OR name ILIKE 'FUCK BOII TEE'
  OR name ILIKE 'BIKER BOII TEE'
  OR name ILIKE 'DGO JERSEY LONG SLEEVE'
  OR name ILIKE 'METAL PRINT WHITE GIRL'
  OR name ILIKE 'METAL PRINT BLACK GIRL'
  OR name ILIKE 'OSITA ALTERNATE COVER POSTER'
);

-- After running, check which of the 12 actually matched (run separately):
-- SELECT name, collection FROM products WHERE collection = 'Self Titled';
-- Anything missing from that list didn't match by name and needs its
-- collection set by hand from the admin panel instead.
