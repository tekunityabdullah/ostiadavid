"use client";

import { useRouter } from "next/navigation";
import { Heart, Play, Video as VideoIcon, X } from "lucide-react";
import type { UnreleasedMediaSummary } from "@/lib/types";
import AddToPlaylistMenu from "./AddToPlaylistMenu";
import { getYouTubeThumbnail } from "./youtube";

interface VideoGridProps {
  videos: UnreleasedMediaSummary[];
  likedIds?: Set<string>;
  onToggleLike?: (id: string) => void;
  onRemove?: (id: string) => void;
  /** Force a flat 2-column grid with no sm breakpoint bump (used under the video detail's "more videos" strip). */
  twoColumn?: boolean;
  /** Hides the like/add-to-playlist hover icons — used on the main Unreleased library grid, which shows tiles unadorned to match the reference design. */
  hideActions?: boolean;
}

export default function VideoGrid({ videos, likedIds, onToggleLike, onRemove, twoColumn, hideActions }: VideoGridProps) {
  const router = useRouter();

  if (!videos.length) return null;

  return (
    <div className={`grid gap-4 ${twoColumn ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
      {videos.map((video) => {
        const isLiked = likedIds?.has(video.id) ?? false;
        const openDetail = () => router.push(`/unreleased/${video.id}`);
        const thumbnail = video.cover_image || (video.youtube_url ? getYouTubeThumbnail(video.youtube_url) : null);

        return (
          <div
            key={video.id}
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
            <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-white/5">
              {thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbnail}
                  alt={video.title}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-10">
                  <VideoIcon className="h-full w-full text-white/30" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition group-hover:scale-105">
                  <Play size={16} fill="black" className="ml-0.5 text-black" />
                </span>
              </div>

              {!hideActions && onToggleLike && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike(video.id);
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
                  <AddToPlaylistMenu mediaId={video.id} />
                </div>
              )}

              {onRemove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(video.id);
                  }}
                  aria-label="Remove from playlist"
                  className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center bg-black/60 text-white/70 transition hover:scale-110 hover:text-red-300"
                >
                  <X size={14} />
                </button>
              )}

            </div>

            <p className="truncate text-center text-xs uppercase tracking-tight text-white">
              {video.title}
            </p>
          </div>
        );
      })}
    </div>
  );
}
