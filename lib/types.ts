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
  price: number;
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
  file_path: string;
  duration_seconds: number | null;
  play_count: number;
  album_id: string | null;
  track_number: number | null;
  created_at: string;
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
