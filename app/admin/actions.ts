"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

export type ProductFormState = {
  message: string;
  ok: boolean;
};

const DIGITAL_DOWNLOADS_BUCKET = "digital-downloads";

export async function addProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const priceValue = String(formData.get("price") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const isExclusive = formData.get("is_exclusive") === "on";
  const isDigital = formData.get("is_digital") === "on";
  const digitalFile = formData.get("digital_file");
  const price = Number(priceValue);

  if (!name || !image || !priceValue) {
    return { ok: false, message: "Name, price, and image URL are required." };
  }

  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, message: "Enter a valid price." };
  }

  if (isDigital && (!(digitalFile instanceof File) || digitalFile.size === 0)) {
    return { ok: false, message: "A WAV file is required for digital downloads." };
  }

  let digitalFilePath: string | null = null;

  if (isDigital && digitalFile instanceof File) {
    const serviceClient = await createServiceClient();
    const path = `${randomUUID()}-${digitalFile.name}`;

    const { error: uploadError } = await serviceClient.storage
      .from(DIGITAL_DOWNLOADS_BUCKET)
      .upload(path, digitalFile, {
        contentType: digitalFile.type || "audio/wav",
      });

    if (uploadError) {
      return { ok: false, message: `File upload failed: ${uploadError.message}` };
    }

    digitalFilePath = path;
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
