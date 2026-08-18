"use client";

import { useCallback, useEffect, useState } from "react";
import AdminAlbumTile from "@/app/admin/AdminAlbumTile";
import AlbumForm from "@/app/admin/AlbumForm";
import { AdminCard, AdminPageHeader, CardHeading } from "@/app/admin/ui";
import type { UnreleasedAlbum } from "@/lib/types";

export default function AdminAlbumsPage() {
  const [albums, setAlbums] = useState<UnreleasedAlbum[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);

  const loadAlbums = useCallback(() => {
    return fetch("/api/admin/albums")
      .then((res) => res.json())
      .then((data) => setAlbums(data))
      .catch((err) => console.error("Failed to load albums:", err))
      .finally(() => setLoadingAlbums(false));
  }, []);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  return (
    <div className="grid gap-10">
      <AdminPageHeader eyebrow="Admin dashboard" title="Albums" />

      <section className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        <AdminCard>
          <CardHeading title="Add album" />
          <AlbumForm onSuccess={loadAlbums} />
        </AdminCard>

        <div className="grid gap-5">
          <div className="flex items-end justify-between gap-4 border-b border-white/15 pb-4">
            <h2 className="text-sm uppercase tracking-[0.2em] text-white/55">Albums</h2>
            <span className="text-sm text-white/45">{albums.length}</span>
          </div>

          {loadingAlbums ? (
            <p className="py-12 text-sm uppercase tracking-tight text-white/50">Loading...</p>
          ) : albums.length === 0 ? (
            <p className="py-12 text-sm uppercase tracking-tight text-white/50">No albums yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {albums.map((album) => (
                <AdminAlbumTile
                  key={album.id}
                  album={album}
                  onDeleted={loadAlbums}
                  onUpdated={loadAlbums}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
