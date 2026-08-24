"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Save } from "lucide-react";
import { updateUnreleasedMedia, type ProductFormState } from "./actions";
import { AdminButton, Field, fileInputClass, inputClass, textareaClass } from "./ui";
import { uploadAdminFile } from "./uploadFile";
import type { UnreleasedAlbum, UnreleasedMediaSummary } from "@/lib/types";

const initialState: ProductFormState = {
  ok: false,
  message: "",
};

// Reads duration client-side from a freshly-picked replacement file, same
// as the add form — only relevant when swapping the underlying audio/video.
function readDuration(file: File, mediaType: "audio" | "video"): Promise<number | null> {
  return new Promise((resolve) => {
    const el = document.createElement(mediaType);
    const url = URL.createObjectURL(file);
    el.preload = "metadata";
    el.src = url;
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(el.duration) ? Math.round(el.duration) : null);
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
  });
}

interface UnreleasedMediaEditFormProps {
  media: UnreleasedMediaSummary;
  albums: UnreleasedAlbum[];
  onSuccess?: () => void;
}

export default function UnreleasedMediaEditForm({ media, albums, onSuccess }: UnreleasedMediaEditFormProps) {
  const [state, dispatch, pending] = useActionState(updateUnreleasedMedia, initialState);
  const [duration, setDuration] = useState<number | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(media.cover_image);
  const [albumId, setAlbumId] = useState(media.album_id ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const coverUrlInputRef = useRef<HTMLInputElement>(null);

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    if (coverUrlInputRef.current) coverUrlInputRef.current.value = "";
  };

  const isYoutube = Boolean(media.youtube_url);
  const mediaType = media.media_type;

  useEffect(() => {
    if (state.ok) onSuccess?.();
  }, [state, onSuccess]);

  // Files are uploaded to /api/admin/upload first — see that route and
  // uploadFile.ts for why — then only their resulting paths/URLs get
  // dispatched to the Server Action. Both file fields here are optional:
  // leaving them untouched keeps whatever's already stored.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;

    setUploadError("");
    setUploading(true);

    try {
      let coverUrl = new FormData(formRef.current).get("cover_image_url");
      let coverUrlString = typeof coverUrl === "string" ? coverUrl.trim() : "";

      if (coverFile) {
        const coverUpload = await uploadAdminFile("unreleased-covers", coverFile);
        coverUrlString = coverUpload.publicUrl;
      }

      let mediaPath = "";
      if (replaceFile) {
        const upload = await uploadAdminFile("unreleased-media", replaceFile);
        mediaPath = upload.path;
      }

      const fd = new FormData(formRef.current);
      fd.delete("replace_file");
      fd.delete("cover_image_file");
      fd.set("cover_image_url", coverUrlString);
      fd.set("media_path", mediaPath);

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
      <input type="hidden" name="media_id" value={media.id} />
      <input type="hidden" name="duration_seconds" value={duration ?? ""} />

      <p className="text-[11px] uppercase tracking-[0.15em] text-white/40">
        {mediaType}
        {isYoutube ? " · YouTube" : ""}
      </p>

      <Field label="Title">
        <input name="title" required defaultValue={media.title} className={inputClass} />
      </Field>

      {mediaType === "audio" && (
        <div className="grid gap-5 border border-white/10 bg-white/[0.02] p-4 sm:grid-cols-2">
          <Field label="Album (optional)">
            <select
              name="album_id"
              value={albumId}
              onChange={(e) => setAlbumId(e.target.value)}
              className={inputClass}
            >
              <option value="">None — standalone track</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.title}
                </option>
              ))}
            </select>
          </Field>

          {albumId && (
            <Field label="Track number">
              <input
                name="track_number"
                type="number"
                min="1"
                defaultValue={media.track_number ?? ""}
                className={inputClass}
              />
            </Field>
          )}
        </div>
      )}

      {mediaType !== "image" && (
        <Field
          label="Price (optional)"
          hint="If set, the detail page shows a working Add to Cart button for this price. Leave blank to keep it not for sale yet."
        >
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={media.price ?? undefined}
            placeholder="900.00"
            className={inputClass}
          />
        </Field>
      )}

      <Field label="Cover image" hint="Optional — tracks/videos without one fall back to the default icon.">
        <div className="flex flex-wrap items-center gap-3">
          {coverPreview && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverPreview} alt="" className="h-11 w-11 shrink-0 object-cover" />
              <button
                type="button"
                onClick={handleRemoveCover}
                className="text-xs uppercase tracking-[0.15em] text-white/50 underline underline-offset-4 transition hover:text-white"
              >
                Remove
              </button>
            </>
          )}
        </div>
        <input
          name="cover_image_file"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            setCoverFile(file);
            setCoverPreview(file ? URL.createObjectURL(file) : media.cover_image);
          }}
          className={`${fileInputClass} mt-2`}
        />
        <p className="mt-2 text-xs text-white/40">Or paste an image URL instead:</p>
        <input
          ref={coverUrlInputRef}
          name="cover_image_url"
          type="url"
          defaultValue={media.cover_image ?? ""}
          placeholder="https://..."
          className={`${inputClass} mt-2`}
        />
      </Field>

      <Field label="Description">
        <textarea
          name="description"
          rows={3}
          defaultValue={media.description ?? ""}
          className={textareaClass}
        />
      </Field>

      {isYoutube ? (
        <Field label="YouTube URL">
          <input
            name="youtube_url"
            type="url"
            required
            defaultValue={media.youtube_url ?? ""}
            className={inputClass}
          />
        </Field>
      ) : (
        <Field
          label={`Replace ${mediaType} file (optional)`}
          hint="Leave blank to keep the current file."
        >
          <input
            name="replace_file"
            type="file"
            accept={mediaType === "audio" ? "audio/*" : mediaType === "video" ? "video/*" : "image/*"}
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setReplaceFile(file);
              setDuration(null);
              if (file && mediaType !== "image") {
                readDuration(file, mediaType).then(setDuration);
              }
            }}
            className={fileInputClass}
          />
        </Field>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <AdminButton type="submit" disabled={busy}>
          <Save size={16} />
          {uploading ? "Uploading..." : pending ? "Saving..." : "Save changes"}
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
