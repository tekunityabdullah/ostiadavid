"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2, Music, Video, ImageIcon, Pencil } from "lucide-react";
import type { UnreleasedAlbum, UnreleasedMediaSummary } from "@/lib/types";
import { deleteUnreleasedMedia, moveUnreleasedMediaOrder } from "./actions";
import { AdminButton, AdminModal } from "./ui";
import UnreleasedMediaEditForm from "./UnreleasedMediaEditForm";

interface AdminUnreleasedTileProps {
  media: UnreleasedMediaSummary;
  albums: UnreleasedAlbum[];
  /** 1-based position within its own media_type group — display only. */
  position?: number;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

export default function AdminUnreleasedTile({
  media,
  albums,
  position,
  onDeleted,
  onUpdated,
}: AdminUnreleasedTileProps) {
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [moving, setMoving] = useState(false);

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

  const handleMove = async (direction: "up" | "down") => {
    setMoving(true);
    const formData = new FormData();
    formData.set("media_id", media.id);
    formData.set("direction", direction);

    try {
      await moveUnreleasedMediaOrder(formData);
      onUpdated?.();
    } finally {
      setMoving(false);
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

      <div className="flex items-center justify-between gap-2 border border-white/10 px-1 py-1">
        <button
          type="button"
          onClick={() => handleMove("up")}
          disabled={moving}
          aria-label="Move up"
          className="p-1.5 text-white/60 transition hover:text-white disabled:opacity-40"
        >
          <ChevronUp size={14} />
        </button>
        <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">
          {position != null ? `#${position}` : ""}
        </span>
        <button
          type="button"
          onClick={() => handleMove("down")}
          disabled={moving}
          aria-label="Move down"
          className="p-1.5 text-white/60 transition hover:text-white disabled:opacity-40"
        >
          <ChevronDown size={14} />
        </button>
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
