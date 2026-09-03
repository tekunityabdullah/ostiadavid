-- Optional second image shown on hover (desktop) / tap (mobile) for
-- products displayed on the Exclusive > Clothes grid, e.g. the back of a
-- jacket. Null means the product only has a front image and the card just
-- shows that one image, no toggle.
ALTER TABLE products ADD COLUMN IF NOT EXISTS back_image TEXT;
 