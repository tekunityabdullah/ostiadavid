"use client";

import { useRouter } from "next/navigation";
import { Heart, X } from "lucide-react";
import type { UnreleasedMediaSummary } from "@/lib/types";
import WaveformIcon from "./WaveformIcon";
import AddToPlaylistMenu from "./AddToPlaylistMenu";
import { useUnreleasedPlayer } from "./PlayerProvider";

interface MusicGridProps {
  tracks: UnreleasedMediaSummary[];
  likedIds?: Set<string>;
  onToggleLike?: (id: string) => void;
  onRemove?: (id: string) => void;
  /** Hides the like/add-to-playlist hover icons — used on the main Unreleased library grid, which shows tiles unadorned to match the reference design. */
  hideActions?: boolean;
  /** Force a flat 2-column grid at every breakpoint — used under a track's own detail page, matching VideoGrid's "more videos" strip. */
  twoColumn?: boolean;
}

export default function MusicGrid({ tracks, likedIds, onToggleLike, onRemove, hideActions, twoColumn }: MusicGridProps) {
  const router = useRouter();
  const { playTrack } = useUnreleasedPlayer();

  if (!tracks.length) return null;

  return (
    // Fixed-count grid on mobile/tablet (always exactly 3 across), but
    // switches to a fixed-width flex-wrap on desktop instead of more grid
    // columns — a rigid column count leaves a short last row hugging the
    // left with empty tracks after it, while flex-wrap + justify-center
    // naturally centers however many tiles fit per row. twoColumn opts out
    // of all that for a plain flat 2-across grid instead.
    <div className={twoColumn ? "grid grid-cols-2 gap-4 sm:flex sm:justify-center sm:gap-6" : "grid grid-cols-3 gap-2 sm:gap-4 lg:flex lg:flex-wrap lg:justify-center"}>
      {tracks.map((track) => {
        const isLiked = likedIds?.has(track.id) ?? false;
        // Clicking a track from the grid starts it playing immediately —
        // same as tapping a row in a track list — and takes you to its page,
        // instead of landing there paused waiting for a manual play press.
        const openDetail = () => {
          playTrack(track);
          router.push(`/unreleased/${track.id}`);
        };

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
            className={`group grid cursor-pointer gap-2 text-left ${
              twoColumn ? "sm:w-40 sm:shrink-0" : "lg:w-40 lg:shrink-0"
            }`}
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
                <WaveformIcon fill className="transition-transform duration-500 ease-out group-hover:scale-[1.05]" />
              )}

              {!hideActions && onToggleLike && (
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
              )}

              {!hideActions && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-1.5 top-10 flex h-7 w-7 items-center justify-center bg-black/60 text-white/70 transition hover:scale-110 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                >
                  <AddToPlaylistMenu mediaId={track.id} />
                </div>
              )}

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

            <p className="truncate text-center text-xs uppercase tracking-tight text-white">{track.title}</p>
          </div>
        );
      })}
    </div>
  );
}
