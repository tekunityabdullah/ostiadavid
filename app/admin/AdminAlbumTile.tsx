"use client";

import { useState } from "react";
import { Disc3, Trash2 } from "lucide-react";
import type { UnreleasedAlbum } from "@/lib/types";
import { deleteAlbum } from "./actions";
import { AdminButton } from "./ui";

interface AdminAlbumTileProps {
  album: UnreleasedAlbum;
  onDeleted?: () => void;
}

export default function AdminAlbumTile({ album, onDeleted }: AdminAlbumTileProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete album "${album.title}"? Tracks stay, just unassigned.`)) return;

    setDeleting(true);
    const formData = new FormData();
    formData.set("album_id", album.id);

    try {
      await deleteAlbum(formData);
      onDeleted?.();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="grid gap-3 border border-white/10 bg-white/[0.02] p-3 transition hover:border-white/20">
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-white/5">
        {album.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={album.cover_image} alt={album.title} className="h-full w-full object-cover" />
        ) : (
          <Disc3 size={32} className="text-white/30" />
        )}
      </div>

      <p className="truncate text-sm uppercase tracking-tight text-white">{album.title}</p>

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
