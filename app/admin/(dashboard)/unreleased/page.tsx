"use client";

import { useCallback, useEffect, useState } from "react";
import AdminUnreleasedTile from "@/app/admin/AdminUnreleasedTile";
import UnreleasedMediaForm from "@/app/admin/UnreleasedMediaForm";
import { AdminCard, AdminPageHeader, CardHeading } from "@/app/admin/ui";
import type { UnreleasedAlbum, UnreleasedMediaSummary } from "@/lib/types";

export default function AdminUnreleasedPage() {
  const [unreleasedMedia, setUnreleasedMedia] = useState<UnreleasedMediaSummary[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [albums, setAlbums] = useState<UnreleasedAlbum[]>([]);

  const loadUnreleasedMedia = useCallback(() => {
    return fetch("/api/admin/unreleased")
      .then((res) => res.json())
      .then((data) => {
        // The API returns { error } (not an array) if the query fails —
        // e.g. a migration hasn't been run on this database yet. Never let
        // that reach .map() and crash the whole page.
        if (Array.isArray(data)) {
          setUnreleasedMedia(data);
          setLoadError("");
        } else {
          setUnreleasedMedia([]);
          setLoadError(data?.error || "Failed to load unreleased media.");
        }
      })
      .catch((err) => {
        console.error("Failed to load unreleased media:", err);
        setUnreleasedMedia([]);
        setLoadError("Failed to load unreleased media.");
      })
      .finally(() => setLoadingMedia(false));
  }, []);

  const loadAlbums = useCallback(() => {
    return fetch("/api/admin/albums")
      .then((res) => res.json())
      .then((data) => setAlbums(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to load albums:", err));
  }, []);

  useEffect(() => {
    loadUnreleasedMedia();
    loadAlbums();
  }, [loadUnreleasedMedia, loadAlbums]);

  return (
    <div className="grid gap-10">
      <AdminPageHeader eyebrow="Admin dashboard" title="Unreleased" />

      <section className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        <AdminCard>
          <CardHeading title="Add track or video" />
          <UnreleasedMediaForm onSuccess={loadUnreleasedMedia} albums={albums} />
        </AdminCard>

        <div className="grid gap-5">
          <div className="flex items-end justify-between gap-4 border-b border-white/15 pb-4">
            <h2 className="text-sm uppercase tracking-[0.2em] text-white/55">
              Unreleased library
            </h2>
            <span className="text-sm text-white/45">{unreleasedMedia.length}</span>
          </div>

          {loadingMedia ? (
            <p className="py-12 text-sm uppercase tracking-tight text-white/50">Loading...</p>
          ) : loadError ? (
            <p className="py-12 text-sm uppercase tracking-tight text-red-300">{loadError}</p>
          ) : unreleasedMedia.length === 0 ? (
            <p className="py-12 text-sm uppercase tracking-tight text-white/50">
              No unreleased media yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {(() => {
                // Position numbers are per media_type group, matching how
                // move up/down is scoped — Videos/Music/Images are three
                // separate grids on the site.
                const counts: Record<string, number> = {};
                return unreleasedMedia.map((media) => {
                  counts[media.media_type] = (counts[media.media_type] ?? 0) + 1;
                  return (
                    <AdminUnreleasedTile
                      key={media.id}
                      media={media}
                      albums={albums}
                      position={counts[media.media_type]}
                      onDeleted={loadUnreleasedMedia}
                      onUpdated={loadUnreleasedMedia}
                    />
                  );
                });
              })()}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
