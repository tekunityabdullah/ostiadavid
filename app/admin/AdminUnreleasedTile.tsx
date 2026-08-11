"use client";

import { useState } from "react";
import { Trash2, Music, Video, ImageIcon, Pencil } from "lucide-react";
import type { UnreleasedAlbum, UnreleasedMediaSummary } from "@/lib/types";
import { deleteUnreleasedMedia } from "./actions";
import { AdminButton, AdminModal } from "./ui";
import UnreleasedMediaEditForm from "./UnreleasedMediaEditForm";

interface AdminUnreleasedTileProps {
  media: UnreleasedMediaSummary;
  albums: UnreleasedAlbum[];
  onDeleted?: () => void;
  onUpdated?: () => void;
}

export default function AdminUnreleasedTile({ media, albums, onDeleted, onUpdated }: AdminUnreleasedTileProps) {
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${media.title}"?`)) return;

    setDeleting(true);
    const formData = new FormData();
    formData.set("media_id", media.id);

    try {
      await deleteUnreleasedMedia(formData);
      onDeleted?.();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="grid gap-3 border border-white/10 bg-white/[0.02] p-3 transition hover:border-white/20">
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-white/5">
        {media.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.cover_image}
            alt={media.title}
            className="h-full w-full object-cover"
          />
        ) : media.media_type === "audio" ? (
          <Music size={32} className="text-white/30" />
        ) : media.media_type === "video" ? (
          <Video size={32} className="text-white/30" />
        ) : (
          <ImageIcon size={32} className="text-white/30" />
        )}
      </div>

      <div className="grid gap-1">
        <p className="truncate text-sm uppercase tracking-tight text-white">
          {media.title}
        </p>
        <p className="text-[11px] uppercase tracking-[0.15em] text-white/40">
          {media.media_type}
          {media.youtube_url ? " · YouTube" : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <AdminButton type="button" variant="secondary" onClick={() => setEditing(true)} className="w-full">
          <Pencil size={14} />
          Edit
        </AdminButton>
        <AdminButton
          type="button"
          variant="danger"
          onClick={handleDelete}
          disabled={deleting}
          className="w-full"
        >
          <Trash2 size={14} />
          {deleting ? "Deleting..." : "Delete"}
        </AdminButton>
      </div>

      {editing && (
        <AdminModal title="Edit media" onClose={() => setEditing(false)}>
          <UnreleasedMediaEditForm
            media={media}
            albums={albums}
            onSuccess={() => {
              setEditing(false);
              onUpdated?.();
            }}
          />
        </AdminModal>
      )}
    </div>
  );
}
