"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, Save } from "lucide-react";
import { addAlbum, updateAlbum, type ProductFormState } from "./actions";
import { AdminButton, Field, fileInputClass, inputClass, textareaClass } from "./ui";
import { uploadAdminFile } from "./uploadFile";
import type { UnreleasedAlbum } from "@/lib/types";

const initialState: ProductFormState = {
  ok: false,
  message: "",
};

interface AlbumFormProps {
  onSuccess?: () => void;
  /** When provided, the form edits this album instead of creating a new one. */
  album?: UnreleasedAlbum;
}

export default function AlbumForm({ onSuccess, album }: AlbumFormProps) {
  const isEditing = Boolean(album);
  const [state, dispatch, pending] = useActionState(isEditing ? updateAlbum : addAlbum, initialState);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(album?.cover_image ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      onSuccess?.();
      if (!isEditing) {
        setCoverFile(null);
        setCoverPreview(null);
        formRef.current?.reset();
      }
    }
  }, [state, onSuccess, isEditing]);

  // Files are uploaded to /api/admin/upload first (see that route and
  // uploadFile.ts for why), then only the resulting URL — a plain string —
  // gets dispatched to the Server Action.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;

    setUploadError("");
    setUploading(true);

    try {
      let coverUrl = new FormData(formRef.current).get("cover_image_url");
      let coverUrlString = typeof coverUrl === "string" ? coverUrl.trim() : "";

      if (coverFile) {
        const upload = await uploadAdminFile("unreleased-covers", coverFile);
        coverUrlString = upload.publicUrl;
      }

      const fd = new FormData(formRef.current);
      fd.delete("cover_image_file");
      fd.set("cover_image_url", coverUrlString);

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
      {isEditing && <input type="hidden" name="album_id" value={album!.id} />}

      <Field label="Album title">
        <input name="title" required defaultValue={album?.title} className={inputClass} />
      </Field>

      <Field label="Cover image">
        <div className="flex flex-wrap items-center gap-3">
          {coverPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverPreview} alt="" className="h-11 w-11 shrink-0 object-cover" />
          )}
          <input
            name="cover_image_file"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setCoverFile(file);
              setCoverPreview(file ? URL.createObjectURL(file) : album?.cover_image ?? null);
            }}
            className={fileInputClass}
          />
        </div>
        <p className="mt-2 text-xs text-white/40">Or paste an image URL instead:</p>
        <input
          name="cover_image_url"
          type="url"
          defaultValue={album?.cover_image ?? ""}
          placeholder="https://..."
          className={`${inputClass} mt-2`}
        />
      </Field>

      <Field label="Description">
        <textarea name="description" rows={3} defaultValue={album?.description ?? ""} className={textareaClass} />
      </Field>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <AdminButton type="submit" disabled={busy}>
          {isEditing ? <Save size={16} /> : <Plus size={16} />}
          {uploading ? "Uploading..." : pending ? "Saving..." : isEditing ? "Save changes" : "Add album"}
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
