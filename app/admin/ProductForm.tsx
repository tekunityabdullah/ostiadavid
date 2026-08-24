"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, Save } from "lucide-react";
import { addProduct, updateProduct, type ProductFormState } from "./actions";
import { AdminButton, Field, fileInputClass, inputClass, textareaClass } from "./ui";
import { uploadAdminFile } from "./uploadFile";
import type { Product } from "@/lib/types";

const initialState: ProductFormState = {
  ok: false,
  message: "",
};

interface ProductFormProps {
  onSuccess?: () => void;
  /** When provided, the form edits this product instead of creating a new one. */
  product?: Product;
}

export default function ProductForm({ onSuccess, product }: ProductFormProps) {
  const isEditing = Boolean(product);
  const [state, dispatch, pending] = useActionState(isEditing ? updateProduct : addProduct, initialState);
  const [isDigital, setIsDigital] = useState(product?.is_digital ?? false);
  const [hasExternalCheckout, setHasExternalCheckout] = useState(
    Boolean(product?.external_checkout_url)
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image ?? null);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      onSuccess?.();
      if (!isEditing) {
        setImageFile(null);
        setImagePreview(null);
        setDigitalFile(null);
        setIsDigital(false);
        formRef.current?.reset();
      }
    }
  }, [state, onSuccess, isEditing]);

  // Files are uploaded to /api/admin/upload first (see that route and
  // uploadFile.ts for why), then only their resulting paths/URLs — plain
  // strings — get dispatched to the Server Action.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;

    setUploadError("");
    setUploading(true);

    try {
      let imageUrl = new FormData(formRef.current).get("image_url");
      let imageUrlString = typeof imageUrl === "string" ? imageUrl.trim() : "";

      if (imageFile) {
        const upload = await uploadAdminFile("product-images", imageFile);
        imageUrlString = upload.publicUrl;
      }

      if (!imageUrlString) {
        setUploadError("An image (upload or URL) is required.");
        setUploading(false);
        return;
      }

      // Keep the existing digital file by default when editing — only
      // replace it if the admin actually picked a new one.
      let digitalFilePath = product?.digital_file_path ?? "";
      if (isDigital) {
        if (digitalFile) {
          const upload = await uploadAdminFile("digital-downloads", digitalFile);
          digitalFilePath = upload.path;
        } else if (!digitalFilePath) {
          setUploadError("A WAV file is required for digital downloads.");
          setUploading(false);
          return;
        }
      } else {
        digitalFilePath = "";
      }

      const fd = new FormData(formRef.current);
      fd.delete("image_file");
      fd.delete("digital_file");
      fd.set("image_url", imageUrlString);
      fd.set("digital_file_path", digitalFilePath);

      dispatch(fd);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const busy = uploading || pending;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid gap-5">
      {isEditing && <input type="hidden" name="product_id" value={product!.id} />}

      <Field label="Product name">
        <input name="name" required defaultValue={product?.name} className={inputClass} />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label={hasExternalCheckout ? "Price (optional)" : "Price"}
          hint={hasExternalCheckout ? "Not required for an external checkout product." : undefined}
        >
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            required={!hasExternalCheckout}
            defaultValue={product?.price ?? undefined}
            className={inputClass}
          />
        </Field>

        <Field label="Category">
          <input
            name="category"
            placeholder="apparel, digital, accessories"
            defaultValue={product?.category ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Collection (optional)"
        hint='Groups this product under a named section on the Collections page (e.g. "Self Titled"). Leave blank to keep it off that page — not every product needs to belong to a collection.'
      >
        <input
          name="collection"
          placeholder="Self Titled"
          defaultValue={product?.collection ?? ""}
          className={inputClass}
        />
      </Field>

      <Field label="Product image">
        <div className="flex flex-wrap items-center gap-3">
          {imagePreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagePreview} alt="" className="h-11 w-11 shrink-0 object-cover" />
          )}
          <input
            name="image_file"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setImageFile(file);
              setImagePreview(file ? URL.createObjectURL(file) : product?.image ?? null);
            }}
            className={fileInputClass}
          />
        </div>
        <p className="mt-2 text-xs text-white/40">Or paste an image URL instead:</p>
        <input
          name="image_url"
          type="url"
          defaultValue={product?.image ?? ""}
          placeholder="https://..."
          className={`${inputClass} mt-2`}
        />
      </Field>

      <Field label="Description">
        <textarea name="description" rows={4} defaultValue={product?.description ?? ""} className={textareaClass} />
      </Field>

      <Field
        label="External checkout URL (optional)"
        hint="If set, the product page shows a single Buy Now button that redirects here instead of Add to Cart / Quick Buy — use this for releases checked out through another platform (e.g. Elastic Stage)."
      >
        <input
          name="external_checkout_url"
          type="url"
          placeholder="https://elasticstage.com/..."
          defaultValue={product?.external_checkout_url ?? ""}
          onChange={(e) => setHasExternalCheckout(e.target.value.trim().length > 0)}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-3 border border-white/10 bg-white/[0.02] p-4">
        <label className="flex items-center gap-3 text-xs uppercase tracking-[0.15em] text-white">
          <input
            name="is_exclusive"
            type="checkbox"
            className="size-4 accent-white"
            defaultChecked={product?.is_exclusive ?? false}
          />
          Exclusive product
        </label>

        <label className="flex items-center gap-3 text-xs uppercase tracking-[0.15em] text-white">
          <input
            name="is_digital"
            type="checkbox"
            className="size-4 accent-white"
            checked={isDigital}
            onChange={(e) => setIsDigital(e.target.checked)}
          />
          Digital download
        </label>
      </div>

      {isDigital && (
        <Field
          label="Digital file (WAV)"
          hint={
            product?.digital_file_path
              ? "A file is already attached — leave blank to keep it, or choose a new one to replace it."
              : "Sent to buyers as a secure download link by email after purchase. Not fulfilled through Printful."
          }
        >
          <input
            name="digital_file"
            type="file"
            accept=".wav,audio/wav"
            required={isDigital && !product?.digital_file_path}
            onChange={(e) => setDigitalFile(e.target.files?.[0] ?? null)}
            className={fileInputClass}
          />
        </Field>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <AdminButton type="submit" disabled={busy}>
          {isEditing ? <Save size={16} /> : <Plus size={16} />}
          {uploading ? "Uploading..." : pending ? "Saving..." : isEditing ? "Save changes" : "Add product"}
        </AdminButton>

        {(uploadError || state.message) && (
          <p className={`text-sm ${!uploadError && state.ok ? "text-white/70" : "text-red-300"}`}>
            {uploadError || state.message}
          </p>
        )}
      </div>
    </form>
  );
}
