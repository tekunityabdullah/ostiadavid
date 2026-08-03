"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { addProduct, type ProductFormState } from "./actions";
import { AdminButton, Field, fileInputClass, inputClass, textareaClass } from "./ui";
import { uploadAdminFile } from "./uploadFile";

const initialState: ProductFormState = {
  ok: false,
  message: "",
};

interface ProductFormProps {
  onSuccess?: () => void;
}

export default function ProductForm({ onSuccess }: ProductFormProps) {
  const [state, dispatch, pending] = useActionState(addProduct, initialState);
  const [isDigital, setIsDigital] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      onSuccess?.();
      setImageFile(null);
      setImagePreview(null);
      setDigitalFile(null);
      setIsDigital(false);
      formRef.current?.reset();
    }
  }, [state, onSuccess]);

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

      let digitalFilePath = "";
      if (isDigital) {
        if (!digitalFile) {
          setUploadError("A WAV file is required for digital downloads.");
          setUploading(false);
          return;
        }
        const upload = await uploadAdminFile("digital-downloads", digitalFile);
        digitalFilePath = upload.path;
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
      <Field label="Product name">
        <input name="name" required className={inputClass} />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Price">
          <input name="price" type="number" min="0" step="0.01" required className={inputClass} />
        </Field>

        <Field label="Category">
          <input
            name="category"
            placeholder="apparel, digital, accessories"
            className={inputClass}
          />
        </Field>
      </div>

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
              setImagePreview(file ? URL.createObjectURL(file) : null);
            }}
            className={fileInputClass}
          />
        </div>
        <p className="mt-2 text-xs text-white/40">Or paste an image URL instead:</p>
        <input
          name="image_url"
          type="url"
          placeholder="https://..."
          className={`${inputClass} mt-2`}
        />
      </Field>

      <Field label="Description">
        <textarea name="description" rows={4} className={textareaClass} />
      </Field>

      <div className="grid gap-3 border border-white/10 bg-white/[0.02] p-4">
        <label className="flex items-center gap-3 text-xs uppercase tracking-[0.15em] text-white">
          <input name="is_exclusive" type="checkbox" className="size-4 accent-white" />
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
          hint="Sent to buyers as a secure download link by email after purchase. Not fulfilled through Printful."
        >
          <input
            name="digital_file"
            type="file"
            accept=".wav,audio/wav"
            required={isDigital}
            onChange={(e) => setDigitalFile(e.target.files?.[0] ?? null)}
            className={fileInputClass}
          />
        </Field>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <AdminButton type="submit" disabled={busy}>
          <Plus size={16} />
          {uploading ? "Uploading..." : pending ? "Saving..." : "Add product"}
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
