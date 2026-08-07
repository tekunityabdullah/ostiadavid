"use client";

import { useState } from "react";
import { Trash2, Music, Video, ImageIcon } from "lucide-react";
import type { UnreleasedMediaSummary } from "@/lib/types";
import { deleteUnreleasedMedia } from "./actions";
import { AdminButton } from "./ui";

interface AdminUnreleasedTileProps {
  media: UnreleasedMediaSummary;
  onDeleted?: () => void;
}

export default function AdminUnreleasedTile({ media, onDeleted }: AdminUnreleasedTileProps) {
  const [deleting, setDeleting] = useState(false);

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
  );
}
