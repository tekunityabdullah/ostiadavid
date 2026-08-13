"use server";

import Stripe from "stripe";
import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const DIGITAL_DOWNLOADS_BUCKET = "digital-downloads";
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 48; // 48 hours

export interface CancelSubscriptionResult {
  ok: boolean;
  message: string;
}

// Cancels the member's recurring $9.99/mo Exclusive membership (created in
// /api/exclusive-checkout) and immediately drops their account back to
// 'regular' — no grace period, since Exclusive content access is gated
// entirely on account_type, not on Stripe subscription status directly.
export async function cancelExclusiveSubscription(): Promise<CancelSubscriptionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Please log in." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, account_type")
    .eq("id", user.id)
    .single();

  if (profile?.account_type !== "exclusive") {
    return { ok: false, message: "You don't have an active Exclusive membership." };
  }

  if (!profile?.stripe_customer_id) {
    return { ok: false, message: "No billing record found for this account." };
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length > 0) {
      await stripe.subscriptions.cancel(subscriptions.data[0].id);
    }
  } catch (err) {
    console.error("Failed to cancel Stripe subscription:", err);
    return { ok: false, message: "Could not reach billing provider. Please try again." };
  }

  const serviceClient = await createServiceClient();
  const { error } = await serviceClient
    .from("profiles")
    .update({ account_type: "regular" })
    .eq("id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/exclusive");

  return { ok: true, message: "Your Exclusive membership has been cancelled." };
}

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
