// Printful API integration using REST API

const PRINTFUL_API_URL = 'https://api.printful.com';
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

if (!PRINTFUL_API_KEY) {
  console.warn('PRINTFUL_API_KEY is not set in environment variables');
}

export interface PrintfulProduct {
  id: number;
  external_id: string;
  sync_product_id: number;
  name: string;
  synced: boolean;
  thumbnail_url: string | null;
  preview_url: string | null;
  variants?: PrintfulVariant[];
}

export interface PrintfulVariant {
  id: number; // sync variant id — pass as `sync_variant_id` when creating orders so Printful reuses the uploaded print files
  external_id: string;
  sync_product_id: number;
  name: string;
  synced: boolean;
  variant_id: number; // catalog (blank product) variant id
  retail_price: string;
  sku: string;
  currency: string;
  availability_status?: string;
  // Only present on sync_variants returned from GET /store/products/{id}.
  // Carries the catalog product's display name, e.g. "... (White / M)", which
  // is the only place Printful's v1 API exposes size/color for a variant.
  product?: {
    variant_id: number;
    product_id: number;
    image: string;
    name: string;
  };
}

export interface PrintfulOrder {
  id: number;
  external_id: string | null;
  status: string;
  created: number;
  updated: number;
  shipping: string;
  items: PrintfulOrderItem[];
  recipient: PrintfulRecipient;
  costs: PrintfulCosts;
}

export interface PrintfulOrderItem {
  id: number;
  external_id: string | null;
  quantity: number;
  product_id: number;
  variant_id: number;
  price: number;
  retail_price: number | null;
  name: string;
  product: PrintfulProduct;
  files: PrintfulFile[];
  options: Record<string, string>;
}

export interface PrintfulRecipient {
  name: string;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  state_code: string;
  state_name: string;
  country_code: string;
  country_name: string;
  zip: string;
  phone: string | null;
  email: string;
}

export interface PrintfulFile {
  id: number;
  type: string;
  url: string | null;
  filename: string | null;
  preview_url: string | null;
  thumbnail_url: string | null;
  size: number;
  width: number | null;
  height: number | null;
  dpi: number | null;
}

export interface PrintfulCosts {
  currency: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface PrintfulStoreProductDetail {
  sync_product: PrintfulProduct;
  sync_variants: PrintfulVariant[];
}

class PrintfulAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = PRINTFUL_API_URL;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let message = response.statusText;
      try {
        const error = await response.json();
        message = `${error.code || response.status} - ${error.error?.message || error.error || response.statusText}`;
      } catch {
        // Response body wasn't JSON — fall back to statusText.
      }
      throw new Error(`Printful API error: ${message}`);
    }

    return response.json();
  }

  // Get all products from Printful
  async getProducts(): Promise<PrintfulProduct[]> {
    const data = await this.request('/store/products');
    return data.result;
  }

  // Get store product by ID, including its variants and retail prices
  async getStoreProduct(productId: number): Promise<PrintfulStoreProductDetail> {
    const data = await this.request(`/store/products/${productId}`);
    return data.result;
  }

  // Get variants for a product
  async getProductVariants(productId: number): Promise<PrintfulVariant[]> {
    const data = await this.request(`/products/${productId}/variants`);
    return data.result;
  }

  // Create an order
  async createOrder(orderData: {
    external_id?: string;
    shipping: string;
    recipient: Partial<PrintfulRecipient>;
    items: {
      external_id?: string;
      quantity: number;
      // Prefer sync_variant_id for store-catalog products — Printful looks up
      // the print files already attached to that sync variant automatically.
      // variant_id (catalog id) requires you to supply `files` yourself.
      sync_variant_id?: number;
      variant_id?: number;
      files?: PrintfulFile[];
      options?: Record<string, string>;
      retail_price?: number;
    }[];
  }): Promise<PrintfulOrder> {
    const data = await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return data.result;
  }

  // Get order by ID
  async getOrder(orderId: number): Promise<PrintfulOrder> {
    const data = await this.request(`/orders/${orderId}`);
    return data.result;
  }

  // Get estimate for order (shipping, costs, etc.)
  async getOrderEstimate(orderData: {
    shipping: string;
    recipient: Partial<PrintfulRecipient>;
    items: {
      variant_id: number;
      quantity: number;
    }[];
  }): Promise<any> {
    const data = await this.request('/orders/estimate', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return data.result;
  }

  // Get countries for shipping
  async getCountries(): Promise<any[]> {
    const data = await this.request('/shipping/countries');
    return data.result;
  }

  // Get shipping rates
  async getShippingRates(params: {
    recipient_country_code: string;
    recipient_state_code?: string;
    recipient_city?: string;
    recipient_zip?: string;
    items: {
      variant_id: number;
      quantity: number;
    }[];
  }): Promise<any[]> {
    const data = await this.request('/shipping/rates', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return data.result;
  }
}

// Export singleton instance
export const printfulAPI = PRINTFUL_API_KEY ? new PrintfulAPI(PRINTFUL_API_KEY) : null;

// Pick the variant used as the product's default (add-to-cart) selection:
// prefer the cheapest variant that Printful reports as currently available.
export function pickDefaultVariant(variants: PrintfulVariant[]): PrintfulVariant | null {
  if (!variants.length) return null;
  const available = variants.filter((v) => !v.availability_status || v.availability_status === 'active');
  const pool = available.length ? available : variants;
  return pool.reduce((cheapest, v) =>
    parseFloat(v.retail_price) < parseFloat(cheapest.retail_price) ? v : cheapest
  );
}

// Printful's v1 API doesn't return size/color as separate fields — the only
// place they show up is the catalog product's display name, e.g.
// "All-Over Print Recycled Unisex Hockey Jersey (White / M)". Falls back to
// the sync variant's own name ("PRODUCT NAME / M") when that's unavailable.
function parseSizeColor(variant: PrintfulVariant): { size: string; color: string } {
  const parenMatch = variant.product?.name?.match(/\(([^)]+)\)\s*$/);
  let raw = parenMatch?.[1];

  if (!raw) {
    const nameParts = variant.name.split('/');
    raw = nameParts.length > 1 ? nameParts[nameParts.length - 1].trim() : '';
  }

  if (!raw) return { size: '', color: '' };

  const parts = raw.split('/').map((s) => s.trim()).filter(Boolean);
  const size = parts.pop() ?? '';
  const color = parts.join(' / ');
  return { size, color };
}

export interface NormalizedVariant {
  syncVariantId: number; // pass as sync_variant_id when creating a Printful order
  size: string;
  color: string;
  price: number;
  image: string | null;
  available: boolean;
}

// Convert raw sync_variants into the flat shape the storefront UI renders
// (size/color picker) and stores as JSON in products.printful_variants.
export function normalizeVariants(variants: PrintfulVariant[]): NormalizedVariant[] {
  return variants.map((v) => {
    const { size, color } = parseSizeColor(v);
    return {
      syncVariantId: v.id,
      size,
      color,
      price: parseFloat(v.retail_price),
      image: v.product?.image ?? null,
      available: !v.availability_status || v.availability_status === 'active',
    };
  });
}

// Helper function to sync a Printful product (with its variants) to Supabase format
export function printfulProductToSupabase(
  printfulProduct: PrintfulProduct,
  variants: PrintfulVariant[],
  isExclusive: boolean = false
) {
  const defaultVariant = pickDefaultVariant(variants);
  const image =
    printfulProduct.thumbnail_url ||
    printfulProduct.preview_url ||
    defaultVariant?.product?.image ||
    '';
  // Strip the trailing "(Color / Size)" so the description reads as prose,
  // e.g. "All-Over Print Recycled Unisex Hockey Jersey".
  const catalogName = defaultVariant?.product?.name?.replace(/\s*\([^)]+\)\s*$/, '').trim();

  return {
    name: printfulProduct.name,
    price: defaultVariant ? parseFloat(defaultVariant.retail_price) : 0,
    image,
    category: 'printful',
    description: catalogName || `Printful product: ${printfulProduct.name}`,
    is_exclusive: isExclusive,
    printful_id: printfulProduct.sync_product_id ?? printfulProduct.id,
    printful_variant_id: defaultVariant?.id ?? null, // sync variant id, used as sync_variant_id at order time
    printful_variants: JSON.stringify(normalizeVariants(variants)),
  };
}
