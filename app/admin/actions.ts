"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

export type ProductFormState = {
  message: string;
  ok: boolean;
};

const DIGITAL_DOWNLOADS_BUCKET = "digital-downloads";
const UNRELEASED_MEDIA_BUCKET = "unreleased-media";

// Files are uploaded client-side to /api/admin/upload before these actions
// run — see that route for why. By the time a form dispatches here, any
// file field has already become a plain string (a storage path, or a
// public URL for public buckets), so these actions only ever see text.

export async function addProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const priceValue = String(formData.get("price") ?? "").trim();
  const image = String(formData.get("image_url") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const isExclusive = formData.get("is_exclusive") === "on";
  const isDigital = formData.get("is_digital") === "on";
  const digitalFilePath = String(formData.get("digital_file_path") ?? "").trim() || null;
  const price = Number(priceValue);

  if (!name || !priceValue || !image) {
    return { ok: false, message: "Name, price, and an image (upload or URL) are required." };
  }

  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, message: "Enter a valid price." };
  }

  if (isDigital && !digitalFilePath) {
    return { ok: false, message: "A WAV file is required for digital downloads." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    name,
    price,
    image,
    category: category || null,
    description: description || null,
    is_exclusive: isExclusive,
    is_digital: isDigital,
    digital_file_path: digitalFilePath,
  });

  if (error) {
    if (digitalFilePath) {
      const serviceClient = await createServiceClient();
      await serviceClient.storage.from(DIGITAL_DOWNLOADS_BUCKET).remove([digitalFilePath]);
    }
    return { ok: false, message: error.message };
  }

  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath("/exclusive");
  revalidatePath("/admin");

  return { ok: true, message: "Product added." };
}

export async function deleteProduct(formData: FormData) {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const productId = String(formData.get("product_id") ?? "").trim();

  if (!productId) {
    return;
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("products")
    .select("digital_file_path")
    .eq("id", productId)
    .single();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    console.error("Failed to delete product:", error.message);
    return;
  }

  if (existing?.digital_file_path) {
    const serviceClient = await createServiceClient();
    await serviceClient.storage
      .from(DIGITAL_DOWNLOADS_BUCKET)
      .remove([existing.digital_file_path]);
  }

  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath("/exclusive");
  revalidatePath("/admin");
}

export async function addUnreleasedMedia(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const title = String(formData.get("title") ?? "").trim();
  const mediaType = String(formData.get("media_type") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const coverImage = String(formData.get("cover_image_url") ?? "").trim() || null;
  const durationValue = String(formData.get("duration_seconds") ?? "").trim();
  const durationSeconds = durationValue ? Number(durationValue) : null;
  const albumId = String(formData.get("album_id") ?? "").trim();
  const trackNumberValue = String(formData.get("track_number") ?? "").trim();
  const trackNumber = trackNumberValue ? Number(trackNumberValue) : null;
  const mediaPath = String(formData.get("media_path") ?? "").trim();

  if (!title || (mediaType !== "audio" && mediaType !== "video")) {
    return { ok: false, message: "Title and a valid media type are required." };
  }

  if (!mediaPath) {
    return { ok: false, message: "An audio or video file is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("unreleased_media").insert({
    title,
    media_type: mediaType,
    description: description || null,
    cover_image: coverImage,
    file_path: mediaPath,
    duration_seconds: Number.isFinite(durationSeconds) ? durationSeconds : null,
    album_id: albumId || null,
    track_number: Number.isFinite(trackNumber) ? trackNumber : null,
  });

  if (error) {
    const serviceClient = await createServiceClient();
    await serviceClient.storage.from(UNRELEASED_MEDIA_BUCKET).remove([mediaPath]);
    return { ok: false, message: error.message };
  }

  revalidatePath("/unreleased");
  revalidatePath("/admin");

  return { ok: true, message: "Track added." };
}

export async function deleteUnreleasedMedia(formData: FormData) {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const mediaId = String(formData.get("media_id") ?? "").trim();

  if (!mediaId) {
    return;
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("unreleased_media")
    .select("file_path")
    .eq("id", mediaId)
    .single();

  const { error } = await supabase
    .from("unreleased_media")
    .delete()
    .eq("id", mediaId);

  if (error) {
    console.error("Failed to delete unreleased media:", error.message);
    return;
  }

  if (existing?.file_path) {
    const serviceClient = await createServiceClient();
    await serviceClient.storage
      .from(UNRELEASED_MEDIA_BUCKET)
      .remove([existing.file_path]);
  }

  revalidatePath("/unreleased");
  revalidatePath("/admin");
}

export async function addAlbum(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const coverImage = String(formData.get("cover_image_url") ?? "").trim() || null;

  if (!title) {
    return { ok: false, message: "Album title is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("unreleased_albums").insert({
    title,
    description: description || null,
    cover_image: coverImage,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/unreleased/albums");
  revalidatePath("/admin");

  return { ok: true, message: "Album added." };
}

export async function deleteAlbum(formData: FormData) {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const albumId = String(formData.get("album_id") ?? "").trim();

  if (!albumId) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("unreleased_albums").delete().eq("id", albumId);

  if (error) {
    console.error("Failed to delete album:", error.message);
    return;
  }

  revalidatePath("/unreleased/albums");
  revalidatePath("/admin");
}

export async function addEvent(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const eventDate = String(formData.get("event_date") ?? "").trim();
  const eventTime = String(formData.get("event_time") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const ticketUrl = String(formData.get("ticket_url") ?? "").trim();
  const coverImage = String(formData.get("cover_image_url") ?? "").trim() || null;

  if (!title || !eventDate) {
    return { ok: false, message: "Title and date are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("events").insert({
    title,
    description: description || null,
    event_date: eventDate,
    event_time: eventTime || null,
    location: location || null,
    ticket_url: ticketUrl || null,
    cover_image: coverImage,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/exclusive");
  revalidatePath("/admin");

  return { ok: true, message: "Event added." };
}

export async function deleteEvent(formData: FormData) {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const eventId = String(formData.get("event_id") ?? "").trim();

  if (!eventId) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) {
    console.error("Failed to delete event:", error.message);
    return;
  }

  revalidatePath("/exclusive");
  revalidatePath("/admin");
}
