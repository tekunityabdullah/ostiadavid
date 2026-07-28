"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ListMusic, Trash2 } from "lucide-react";
import type { UnreleasedMediaSummary } from "@/lib/types";
import { usePlaylists } from "./usePlaylists";
import { useLikedMedia } from "./useLikedMedia";
import AudioTrackList from "./AudioTrackList";
import VideoGrid from "./VideoGrid";

export default function PlaylistDetail({ playlistId }: { playlistId: string }) {
  const { playlists, removeFromPlaylist, deletePlaylist } = usePlaylists();
  const { liked, toggleLike } = useLikedMedia();
  const [media, setMedia] = useState<UnreleasedMediaSummary[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/unreleased/list")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMedia(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const playlist = playlists.find((p) => p.id === playlistId);

  const items = useMemo(() => {
    if (!playlist) return [];
    return playlist.mediaIds
      .map((id) => media.find((m) => m.id === id))
      .filter((m): m is UnreleasedMediaSummary => Boolean(m));
  }, [playlist, media]);

  const audioItems = items.filter((m) => m.media_type === "audio");
  const videoItems = items.filter((m) => m.media_type === "video");

  if (!loaded) {
    return <p className="py-12 text-sm uppercase tracking-tight text-white/50">Loading...</p>;
  }

  if (!playlist) {
    return (
      <div className="text-center">
        <p className="py-12 text-sm uppercase tracking-tight text-white/50">
          Playlist not found on this device.
        </p>
        <Link
          href="/unreleased/playlists"
          className="text-[11px] uppercase tracking-[0.2em] text-white/40 transition hover:text-white"
        >
          Back to playlists
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[900px]">
      <Link
        href="/unreleased/playlists"
        className="mb-8 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-white/40 transition hover:text-white"
      >
        <ChevronLeft size={14} />
        Playlists
      </Link>

      <div className="mb-10 flex items-center gap-5">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-white/5 sm:h-24 sm:w-24">
          <ListMusic size={28} className="text-white/30" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">Playlist</span>
          <h1 className="mt-1 truncate text-xl font-medium uppercase tracking-wide text-white sm:text-2xl">
            {playlist.name}
          </h1>
          <p className="mt-1 text-xs text-white/40">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm(`Delete playlist "${playlist.name}"?`)) {
              deletePlaylist(playlist.id);
            }
          }}
          aria-label="Delete playlist"
          className="ml-auto shrink-0 text-white/30 transition hover:text-red-300"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {items.length === 0 ? (
        <p className="py-12 text-center text-sm uppercase tracking-tight text-white/50">
          Nothing added yet — use the list icon on any track or video to add
          it here.
        </p>
      ) : (
        <div className="grid gap-14">
          {audioItems.length > 0 && (
            <AudioTrackList
              tracks={audioItems}
              likedIds={liked}
              onToggleLike={toggleLike}
              onRemove={(id) => removeFromPlaylist(playlist.id, id)}
            />
          )}
          {videoItems.length > 0 && (
            <VideoGrid
              videos={videoItems}
              likedIds={liked}
              onToggleLike={toggleLike}
              onRemove={(id) => removeFromPlaylist(playlist.id, id)}
            />
          )}
        </div>
      )}
    </div>
  );
}
