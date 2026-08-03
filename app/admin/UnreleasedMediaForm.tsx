"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { addUnreleasedMedia, type ProductFormState } from "./actions";
import { AdminButton, Field, fileInputClass, inputClass, textareaClass } from "./ui";
import { uploadAdminFile } from "./uploadFile";
import type { UnreleasedAlbum } from "@/lib/types";

const initialState: ProductFormState = {
  ok: false,
  message: "",
};

interface UnreleasedMediaFormProps {
  onSuccess?: () => void;
  albums: UnreleasedAlbum[];
}

// Reads duration client-side from the file itself before upload, so the
// track list can show real run times without ever downloading the file.
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

export default function UnreleasedMediaForm({ onSuccess, albums }: UnreleasedMediaFormProps) {
  const [state, dispatch, pending] = useActionState(addUnreleasedMedia, initialState);
  const [mediaType, setMediaType] = useState<"audio" | "video">("audio");
  const [duration, setDuration] = useState<number | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [albumId, setAlbumId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      onSuccess?.();
      setMediaFile(null);
      setCoverFile(null);
      setCoverPreview(null);
      setDuration(null);
      formRef.current?.reset();
    }
  }, [state, onSuccess]);

  // Files are uploaded to /api/admin/upload first (see that route and
  // uploadFile.ts for why), then only their resulting paths/URLs — plain
  // strings — get dispatched to the Server Action.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mediaFile || !formRef.current) return;

    setUploadError("");
    setUploading(true);

    try {
      const mediaUpload = await uploadAdminFile("unreleased-media", mediaFile);

      let coverUrl = new FormData(formRef.current).get("cover_image_url");
      let coverUrlString = typeof coverUrl === "string" ? coverUrl.trim() : "";

      if (coverFile) {
        const coverUpload = await uploadAdminFile("unreleased-covers", coverFile);
        coverUrlString = coverUpload.publicUrl;
      }

      const fd = new FormData(formRef.current);
      fd.delete("media_file");
      fd.delete("cover_image_file");
      fd.set("media_path", mediaUpload.path);
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
      <input type="hidden" name="duration_seconds" value={duration ?? ""} />

      <Field label="Title">
        <input name="title" required className={inputClass} />
      </Field>

      <Field label="Media type">
        <select
          name="media_type"
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value as "audio" | "video")}
          className={inputClass}
        >
          <option value="audio">Audio</option>
          <option value="video">Video</option>
        </select>
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
              <input name="track_number" type="number" min="1" className={inputClass} />
            </Field>
          )}
        </div>
      )}

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
              setCoverPreview(file ? URL.createObjectURL(file) : null);
            }}
            className={fileInputClass}
          />
        </div>
        <p className="mt-2 text-xs text-white/40">Or paste an image URL instead:</p>
        <input
          name="cover_image_url"
          type="url"
          placeholder="https://..."
          className={`${inputClass} mt-2`}
        />
      </Field>

      <Field label="Description">
        <textarea name="description" rows={3} className={textareaClass} />
      </Field>

      <Field
        label={mediaType === "audio" ? "Audio file" : "Video file"}
        hint={
          <>
            Stored privately and streamed on-site only — never offered as a download.
            {duration !== null &&
              ` Detected length: ${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, "0")}.`}
          </>
        }
      >
        <input
          name="media_file"
          type="file"
          accept={mediaType === "audio" ? "audio/*" : "video/*"}
          required
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            setMediaFile(file);
            setDuration(null);
            if (file) readDuration(file, mediaType).then(setDuration);
          }}
          className={fileInputClass}
        />
      </Field>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <AdminButton type="submit" disabled={busy}>
          <Plus size={16} />
          {uploading ? "Uploading..." : pending ? "Saving..." : "Add to Unreleased"}
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
