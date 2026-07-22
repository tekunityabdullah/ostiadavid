"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";

const DIGITAL_DOWNLOADS_BUCKET = "digital-downloads";
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 48; // 48 hours

export interface DownloadUrlResult {
  url: string | null;
  error?: string;
}

// Mints a fresh signed download URL for a digital product — but only if the
// current user actually has a purchased order_item for it. Access to the
// product never expires as long as the order exists; only each individual
// link does, which is why this can be called again any time.
export async function getDigitalDownloadUrl(
  productId: string
): Promise<DownloadUrlResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { url: null, error: "Please log in." };
  }

  // RLS on order_items only returns rows whose parent order belongs to
  // auth.uid(), so finding a match here is proof of purchase.
  const { data: orderItem } = await supabase
    .from("order_items")
    .select("id")
    .eq("product_id", productId)
    .limit(1)
    .maybeSingle();

  if (!orderItem) {
    return { url: null, error: "No purchase found for this item." };
  }

  const serviceClient = await createServiceClient();
  const { data: product } = await serviceClient
    .from("products")
    .select("digital_file_path")
    .eq("id", productId)
    .single();

  if (!product?.digital_file_path) {
    return { url: null, error: "File not found." };
  }

  const { data: signed, error } = await serviceClient.storage
    .from(DIGITAL_DOWNLOADS_BUCKET)
    .createSignedUrl(product.digital_file_path, SIGNED_URL_EXPIRY_SECONDS, {
      download: true,
    });

  if (error || !signed?.signedUrl) {
    return { url: null, error: "Could not generate download link." };
  }

  return { url: signed.signedUrl };
}
