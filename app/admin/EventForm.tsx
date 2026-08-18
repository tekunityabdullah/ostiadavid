"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, Save } from "lucide-react";
import { addEvent, updateEvent, type ProductFormState } from "./actions";
import { AdminButton, Field, fileInputClass, inputClass, textareaClass } from "./ui";
import { uploadAdminFile } from "./uploadFile";
import type { EventItem } from "@/lib/types";

const initialState: ProductFormState = {
  ok: false,
  message: "",
};

interface EventFormProps {
  onSuccess?: () => void;
  /** When provided, the form edits this event instead of creating a new one. */
  event?: EventItem;
}

export default function EventForm({ onSuccess, event }: EventFormProps) {
  const isEditing = Boolean(event);
  const [state, dispatch, pending] = useActionState(isEditing ? updateEvent : addEvent, initialState);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(event?.cover_image ?? null);
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
        const upload = await uploadAdminFile("event-covers", coverFile);
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
      {isEditing && <input type="hidden" name="event_id" value={event!.id} />}

      <Field label="Event title">
        <input name="title" required defaultValue={event?.title} className={inputClass} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Date">
          <input name="event_date" type="date" required defaultValue={event?.event_date} className={inputClass} />
        </Field>

        <Field label="Time (optional)">
          <input name="event_time" placeholder="8:00 PM" defaultValue={event?.event_time ?? ""} className={inputClass} />
        </Field>
      </div>

      <Field label="Location (optional)">
        <input name="location" placeholder="Venue, City" defaultValue={event?.location ?? ""} className={inputClass} />
      </Field>

      <Field label="Ticket URL (optional)">
        <input
          name="ticket_url"
          type="url"
          placeholder="https://..."
          defaultValue={event?.ticket_url ?? ""}
          className={inputClass}
        />
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
              setCoverPreview(file ? URL.createObjectURL(file) : event?.cover_image ?? null);
            }}
            className={fileInputClass}
          />
        </div>
        <p className="mt-2 text-xs text-white/40">Or paste an image URL instead:</p>
        <input
          name="cover_image_url"
          type="url"
          defaultValue={event?.cover_image ?? ""}
          placeholder="https://..."
          className={`${inputClass} mt-2`}
        />
      </Field>

      <Field label="Description">
        <textarea name="description" rows={3} defaultValue={event?.description ?? ""} className={textareaClass} />
      </Field>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <AdminButton type="submit" disabled={busy}>
          {isEditing ? <Save size={16} /> : <Plus size={16} />}
          {uploading ? "Uploading..." : pending ? "Saving..." : isEditing ? "Save changes" : "Add event"}
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
