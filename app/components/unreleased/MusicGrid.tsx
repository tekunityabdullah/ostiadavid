"use client";

import { useRouter } from "next/navigation";
import { Heart, X } from "lucide-react";
import type { UnreleasedMediaSummary } from "@/lib/types";
import WaveformIcon from "./WaveformIcon";
import AddToPlaylistMenu from "./AddToPlaylistMenu";

interface MusicGridProps {
  tracks: UnreleasedMediaSummary[];
  likedIds: Set<string>;
  onToggleLike: (id: string) => void;
  onRemove?: (id: string) => void;
}

export default function MusicGrid({ tracks, likedIds, onToggleLike, onRemove }: MusicGridProps) {
  const router = useRouter();

  if (!tracks.length) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {tracks.map((track) => {
        const isLiked = likedIds.has(track.id);
        const openDetail = () => router.push(`/unreleased/${track.id}`);

        return (
          <div
            key={track.id}
            role="button"
            tabIndex={0}
            onClick={openDetail}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openDetail();
              }
            }}
            className="group grid cursor-pointer gap-2 text-left"
          >
            <div className="relative flex aspect-square items-center justify-center overflow-hidden border border-white/15">
              {track.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={track.cover_image}
                  alt={track.title}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                />
              ) : (
                <WaveformIcon size={64} className="text-white/30" />
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLike(track.id);
                }}
                aria-label={isLiked ? "Unlike" : "Like"}
                aria-pressed={isLiked}
                className={`absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center bg-black/60 transition hover:scale-110 ${
                  isLiked ? "text-white" : "text-white/70 sm:opacity-0 sm:group-hover:opacity-100"
                }`}
              >
                <Heart size={14} fill={isLiked ? "white" : "none"} />
              </button>

              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-1.5 top-10 flex h-7 w-7 items-center justify-center bg-black/60 text-white/70 transition hover:scale-110 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
              >
                <AddToPlaylistMenu mediaId={track.id} />
              </div>

              {onRemove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(track.id);
                  }}
                  aria-label="Remove from playlist"
                  className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center bg-black/60 text-white/70 transition hover:scale-110 hover:text-red-300"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <p className="truncate text-xs uppercase tracking-tight text-white">{track.title}</p>
          </div>
        );
      })}
    </div>
  );
}
