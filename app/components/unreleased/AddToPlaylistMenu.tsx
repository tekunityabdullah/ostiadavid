"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ListPlus, Plus } from "lucide-react";
import { usePlaylists } from "./usePlaylists";

interface AddToPlaylistMenuProps {
  mediaId: string;
  className?: string;
  label?: string;
}

export default function AddToPlaylistMenu({ mediaId, className, label }: AddToPlaylistMenuProps) {
  const { playlists, createPlaylist, addToPlaylist } = usePlaylists();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const playlist = createPlaylist(name);
    addToPlaylist(playlist.id, mediaId);
    setNewName("");
  };

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        aria-label="Add to playlist"
        aria-haspopup="true"
        aria-expanded={open}
        className={
          label
            ? "inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-white/40 transition hover:text-white"
            : "transition hover:scale-110"
        }
      >
        <ListPlus size={15} />
        {label}
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full z-50 mt-2 w-56 border border-white/15 bg-black shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
        >
          <div className="max-h-48 overflow-y-auto py-1">
            {playlists.length === 0 ? (
              <p className="px-3 py-3 text-xs text-white/40">No playlists yet.</p>
            ) : (
              playlists.map((p) => {
                const has = p.mediaIds.includes(mediaId);
                return (
                  <button
                    key={p.id}
                    onClick={() => addToPlaylist(p.id, mediaId)}
                    disabled={has}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-white transition hover:bg-white/5 disabled:cursor-default disabled:opacity-50"
                  >
                    <span className="truncate">{p.name}</span>
                    {has && <Check size={13} />}
                  </button>
                );
              })
            )}
          </div>

          <div className="flex items-center gap-1 border-t border-white/10 p-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreate();
                }
              }}
              placeholder="New playlist"
              className="h-8 w-full bg-white/5 px-2 text-xs text-white outline-none placeholder:text-white/30"
            />
            <button
              onClick={handleCreate}
              aria-label="Create playlist"
              className="flex h-8 w-8 shrink-0 items-center justify-center bg-white text-black transition hover:bg-white/90"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
