export type AccountType = "regular" | "exclusive";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  account_type: AccountType;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  // Only optional for an external-checkout product (see
  // external_checkout_url below) — every product sold through our own
  // cart/checkout still requires one.
  price: number | null;
  image: string;
  category: string | null;
  description: string | null;
  is_exclusive: boolean;
  created_at: string;
  printful_id?: number | null;
  printful_variant_id?: number | null;
  printful_variants?: string | null;
  is_digital?: boolean;
  digital_file_path?: string | null;
  // When set, this product isn't sold through our own cart/checkout at
  // all — the product page shows a single "Buy Now" link straight out to
  // this URL instead (e.g. a release checked out through a platform like
  // Elastic Stage that has no API to integrate with).
  external_checkout_url?: string | null;
  // Manual display order — lower shows first. Scoped within is_exclusive
  // (regular and exclusive products are separate lists on the storefront,
  // so reordering one never affects the other).
  sort_order?: number;
  // Groups this product under a named section on the Collections page (e.g.
  // "Self Titled"). Null/unset means it doesn't appear there at all — the
  // Collections page only shows products an admin has explicitly assigned
  // to a collection, not every regular product.
  collection?: string | null;
}

export interface CartItem {
  productId: string;
  // Printful sync variant id for the specific size/color chosen, if this is
  // a Printful product with variants. Distinct variants of the same product
  // are separate cart lines.
  variantId?: number | null;
  variantLabel?: string | null;
  name: string;
  price: number;
  image: string;
  quantity: number;
  isDigital?: boolean;
  // Mirrors the source product's is_exclusive flag — lets the cart, its
  // header badge, and checkout stay scoped separately for the Exclusive
  // section vs. the regular site, even though both share one cart store.
  isExclusive?: boolean;
}

export interface ShippingAddress {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  stateCode: string;
  countryCode: string;
  zip: string;
  phone?: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  stripe_session_id: string | null;
  total: number;
  status: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
}

export const EXCLUSIVE_STRIPE_LINK =
  "https://buy.stripe.com/8x29ASejAfF44K20uLbII00";

export type MediaType = "audio" | "video" | "image";

export interface UnreleasedMedia {
  id: string;
  title: string;
  media_type: MediaType;
  description: string | null;
  cover_image: string | null;
  file_path: string | null;
  // Set instead of file_path for a video that's a YouTube link rather than
  // an uploaded file — rendered on-site via iframe embed.
  youtube_url: string | null;
  duration_seconds: number | null;
  play_count: number;
  album_id: string | null;
  track_number: number | null;
  created_at: string;
  // Null means this track/video isn't for sale yet — Add to Cart stays
  // hidden on its detail page until an admin sets a price.
  price?: number | null;
  // Manual display order — lower shows first. Scoped within media_type
  // (Videos/Music/Images are separate grids on the site, so reordering one
  // never affects the others).
  sort_order?: number;
}

// Metadata sent to the browser — deliberately omits `file_path` so the
// storage path never reaches the client. Playback goes through
// /api/unreleased/stream, which resolves the path server-side.
export type UnreleasedMediaSummary = Omit<UnreleasedMedia, "file_path">;

export interface UnreleasedAlbum {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  created_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  cover_image: string | null;
  ticket_url: string | null;
  created_at: string;
}
