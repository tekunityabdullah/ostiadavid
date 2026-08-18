"use client";

import { useState } from "react";
import { Disc3, Pencil, Trash2 } from "lucide-react";
import type { UnreleasedAlbum } from "@/lib/types";
import { deleteAlbum } from "./actions";
import { AdminButton, AdminModal } from "./ui";
import AlbumForm from "./AlbumForm";

interface AdminAlbumTileProps {
  album: UnreleasedAlbum;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

export default function AdminAlbumTile({ album, onDeleted, onUpdated }: AdminAlbumTileProps) {
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);

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
        <AdminModal title="Edit album" onClose={() => setEditing(false)}>
          <AlbumForm
            album={album}
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
