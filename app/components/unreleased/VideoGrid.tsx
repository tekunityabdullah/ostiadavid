"use client";

import { useRouter } from "next/navigation";
import { Heart, Play, Video as VideoIcon, X } from "lucide-react";
import type { UnreleasedMediaSummary } from "@/lib/types";
import { formatCount, formatTime } from "./format";
import { ARTIST_NAME } from "./constants";
import AddToPlaylistMenu from "./AddToPlaylistMenu";
import { getYouTubeThumbnail } from "./youtube";

interface VideoGridProps {
  videos: UnreleasedMediaSummary[];
  likedIds: Set<string>;
  onToggleLike: (id: string) => void;
  onRemove?: (id: string) => void;
  /** Force a plain 2-column grid (used under the video detail's "more videos" strip) instead of the default responsive 1→4 column layout. */
  twoColumn?: boolean;
}

export default function VideoGrid({ videos, likedIds, onToggleLike, onRemove, twoColumn }: VideoGridProps) {
  const router = useRouter();

  if (!videos.length) return null;

  return (
    <div className={`grid gap-4 ${twoColumn ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}>
      {videos.map((video) => {
        const isLiked = likedIds.has(video.id);
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
                <VideoIcon size={28} className="text-white/30" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition group-hover:scale-105">
                  <Play size={16} fill="black" className="ml-0.5 text-black" />
                </span>
              </div>

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

              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-1.5 top-10 flex h-7 w-7 items-center justify-center bg-black/60 text-white/70 transition hover:scale-110 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
              >
                <AddToPlaylistMenu mediaId={video.id} />
              </div>

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

              {video.duration_seconds != null && (
                <span className="absolute bottom-1.5 right-1.5 bg-black/85 px-1.5 py-0.5 text-[10px] tabular-nums text-white">
                  {formatTime(video.duration_seconds)}
                </span>
              )}
            </div>

            <div className="flex gap-2.5 sm:gap-2">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center bg-white/10 text-xs font-medium uppercase text-white/70 sm:h-6 sm:w-6 sm:text-[10px]">
                {ARTIST_NAME.charAt(0)}
              </span>
              <div className="grid min-w-0 gap-0.5">
                <p className="truncate text-sm tracking-tight text-white sm:text-xs">
                  {video.title}
                </p>
                <p className="truncate text-xs text-white/40 sm:text-[11px]">{ARTIST_NAME}</p>
                <p className="truncate text-xs text-white/40 sm:text-[11px]">
                  {formatCount(video.play_count)} {video.play_count === 1 ? "view" : "views"}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
