"use client";

import Link from "next/link";
import { Heart, Pause, Play, Shuffle, X } from "lucide-react";
import type { UnreleasedMediaSummary } from "@/lib/types";
import { useUnreleasedPlayer } from "./PlayerProvider";
import { formatTime } from "./format";
import { ARTIST_NAME } from "./constants";
import AddToPlaylistMenu from "./AddToPlaylistMenu";
import WaveformIcon from "./WaveformIcon";

function EqualizerBars() {
  return (
    <span className="flex h-3.5 items-end gap-[2px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[3px] animate-bounce bg-white"
          style={{
            height: "100%",
            animationDelay: `${i * 0.15}s`,
            animationDuration: "0.9s",
          }}
        />
      ))}
    </span>
  );
}

interface AudioTrackListProps {
  tracks: UnreleasedMediaSummary[];
  likedIds: Set<string>;
  onToggleLike: (id: string) => void;
  onRemove?: (id: string) => void;
  // Strips this down to just the thumbnail, song name, and duration — no
  // header (play all / shuffle / track count), no artist subtitle, no
  // like/playlist icons, no dividers. Used for the "More Tracks" list under
  // a track's own detail page, which doesn't need a second transport UI.
  minimal?: boolean;
}

export default function AudioTrackList({
  tracks,
  likedIds,
  onToggleLike,
  onRemove,
  minimal = false,
}: AudioTrackListProps) {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    shuffle,
    toggleShuffle,
    playTrack,
    togglePlay,
  } = useUnreleasedPlayer();

  if (!tracks.length) return null;

  const handlePlayAll = () => {
    if (currentTrack && tracks.some((t) => t.id === currentTrack.id)) {
      togglePlay();
    } else {
      playTrack(tracks[0]);
    }
  };

  const isLibraryPlaying =
    isPlaying && currentTrack && tracks.some((t) => t.id === currentTrack.id);

  return (
    <div className="w-full">
      {!minimal && (
        <div className="mb-5 flex items-center gap-4 px-1">
          <button
            onClick={handlePlayAll}
            aria-label={isLibraryPlaying ? "Pause" : "Play all"}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-[0_4px_20px_rgba(255,255,255,0.12)] transition hover:scale-105 active:scale-95"
          >
            {isLibraryPlaying ? (
              <Pause size={18} fill="black" />
            ) : (
              <Play size={18} fill="black" className="ml-0.5" />
            )}
          </button>
          <button
            onClick={toggleShuffle}
            aria-label="Toggle shuffle"
            aria-pressed={shuffle}
            className={`flex h-9 w-9 items-center justify-center transition hover:opacity-70 ${
              shuffle ? "text-white" : "text-white/40"
            }`}
          >
            <Shuffle size={18} />
          </button>
          <span className="ml-auto text-[10px] uppercase tracking-[0.2em] text-white/30">
            {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
          </span>
        </div>
      )}

      <div className={`flex flex-col ${minimal ? "" : "border-t border-white/10"}`}>
        {tracks.map((track, index) => {
          const isActive = currentTrack?.id === track.id;
          const isLiked = likedIds.has(track.id);

          if (minimal) {
            return (
              <div
                key={track.id}
                role="button"
                tabIndex={0}
                onClick={() => playTrack(track)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    playTrack(track);
                  }
                }}
                className={`flex cursor-pointer items-center gap-3 px-2 py-3 text-left transition-colors duration-200 ${
                  isActive ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden bg-white/5 sm:h-12 sm:w-12">
                  {track.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={track.cover_image}
                      alt={track.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <WaveformIcon fill />
                  )}
                </span>

                <span
                  className={`min-w-0 flex-1 truncate text-sm tracking-tight ${
                    isActive ? "text-white" : "text-white/85"
                  }`}
                >
                  {track.title}
                </span>

                <span className="shrink-0 text-xs tabular-nums text-white/40">
                  {formatTime(track.duration_seconds)}
                </span>
              </div>
            );
          }

          return (
            <div
              key={track.id}
              role="button"
              tabIndex={0}
              onClick={() => playTrack(track)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  playTrack(track);
                }
              }}
              className={`group relative grid cursor-pointer grid-cols-[28px_40px_1fr_auto_auto] items-center gap-3 border-b border-white/10 px-2 py-3 text-left transition-colors duration-200 sm:grid-cols-[32px_48px_1fr_auto_auto] ${
                isActive ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-0 h-full w-[2px] bg-white" />
              )}

              <span className="flex items-center justify-center text-xs tabular-nums text-white/40">
                {isActive && isLoading ? (
                  <span className="block h-2.5 w-2.5 animate-pulse rounded-full bg-white/60" />
                ) : isActive && isPlaying ? (
                  <EqualizerBars />
                ) : (
                  <>
                    <span className="group-hover:hidden">{index + 1}</span>
                    <Play
                      size={14}
                      fill="white"
                      className="hidden text-white group-hover:block"
                    />
                  </>
                )}
              </span>

              <Link
                href={`/unreleased/${track.id}`}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Open ${track.title}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden bg-white/5 sm:h-12 sm:w-12"
              >
                {track.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={track.cover_image}
                    alt={track.title}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                ) : (
                  <WaveformIcon fill />
                )}
              </Link>

              <span className="min-w-0">
                <Link
                  href={`/unreleased/${track.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className={`block truncate text-sm tracking-tight hover:underline ${
                    isActive ? "text-white" : "text-white/85"
                  }`}
                >
                  {track.title}
                </Link>
                <p className="truncate text-xs text-white/40">
                  {ARTIST_NAME}
                  {track.description ? ` · ${track.description}` : ""}
                </p>
              </span>

              <span className="text-xs tabular-nums text-white/40">
                {formatTime(track.duration_seconds)}
              </span>

              <span
                className={`flex items-center gap-3 pr-1 text-white/70 transition ${
                  isLiked || onRemove
                    ? ""
                    : "sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                }`}
              >
                <AddToPlaylistMenu mediaId={track.id} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike(track.id);
                  }}
                  aria-label={isLiked ? "Unlike" : "Like"}
                  aria-pressed={isLiked}
                  className={`transition hover:scale-110 ${isLiked ? "text-white" : ""}`}
                >
                  <Heart size={15} fill={isLiked ? "white" : "none"} />
                </button>
                {onRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(track.id);
                    }}
                    aria-label="Remove from playlist"
                    className="transition hover:scale-110 hover:text-red-300"
                  >
                    <X size={15} />
                  </button>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
