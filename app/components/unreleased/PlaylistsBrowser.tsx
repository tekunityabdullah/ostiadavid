"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ListMusic, Plus, Trash2 } from "lucide-react";
import type { UnreleasedMediaSummary } from "@/lib/types";
import { usePlaylists } from "./usePlaylists";

export default function PlaylistsBrowser() {
  const { playlists, createPlaylist, deletePlaylist } = usePlaylists();
  const [media, setMedia] = useState<UnreleasedMediaSummary[]>([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetch("/api/unreleased/list")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMedia(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    createPlaylist(name);
    setNewName("");
  };

  return (
    <div className="w-full max-w-[900px]">
      <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCreate();
            }
          }}
          placeholder="New playlist name"
          className="h-11 w-full border border-white/20 bg-black px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white sm:max-w-xs"
        />
        <button
          onClick={handleCreate}
          className="inline-flex h-11 items-center justify-center gap-2 border border-white bg-white px-4 text-xs font-medium uppercase tracking-tight text-black transition hover:bg-black hover:text-white"
        >
          <Plus size={16} />
          Create
        </button>
      </div>

      {playlists.length === 0 ? (
        <p className="py-12 text-center text-sm uppercase tracking-tight text-white/50">
          No playlists yet — create one above, or add a track/video to a new
          playlist from its list icon.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {playlists.map((playlist) => {
            const cover = playlist.mediaIds
              .map((id) => media.find((m) => m.id === id))
              .find((item) => item?.cover_image)?.cover_image;

            return (
              <div key={playlist.id} className="group grid gap-2">
                <Link href={`/unreleased/playlists/${playlist.id}`} className="grid gap-2">
                  <div className="flex aspect-square items-center justify-center overflow-hidden bg-white/5">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ListMusic size={28} className="text-white/30" />
                    )}
                  </div>
                  <div>
                    <p className="truncate text-xs uppercase tracking-tight text-white">
                      {playlist.name}
                    </p>
                    <p className="text-[11px] text-white/40">
                      {playlist.mediaIds.length}{" "}
                      {playlist.mediaIds.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete playlist "${playlist.name}"?`)) {
                      deletePlaylist(playlist.id);
                    }
                  }}
                  className="inline-flex items-center gap-1 text-[11px] uppercase tracking-tight text-white/30 opacity-0 transition hover:text-red-300 group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
