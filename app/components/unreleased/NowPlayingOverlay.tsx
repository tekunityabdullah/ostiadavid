"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Music,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  X,
} from "lucide-react";
import { useUnreleasedPlayer } from "./PlayerProvider";
import { formatTime } from "./format";
import { ARTIST_NAME } from "./constants";

type Tab = "playing" | "queue";

export default function NowPlayingOverlay({ onClose }: { onClose: () => void }) {
  const {
    queue,
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    shuffle,
    repeatMode,
    togglePlay,
    seekTo,
    toggleShuffle,
    cycleRepeat,
    playNext,
    playPrevious,
    playTrack,
  } = useUnreleasedPlayer();

  const [tab, setTab] = useState<Tab>("playing");

  if (!currentTrack) return null;

  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
          Now Playing
        </span>
        <button
          onClick={onClose}
          aria-label="Close"
          className="-m-2 p-2 text-white transition hover:opacity-70"
        >
          <X size={22} />
        </button>
      </div>

      <div className="mb-6 flex justify-center gap-2 text-[11px]">
        {(["playing", "queue"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border px-4 py-1.5 uppercase tracking-[0.15em] transition ${
              tab === t
                ? "border-white bg-white text-black"
                : "border-white/20 text-white/50 hover:border-white/40 hover:text-white"
            }`}
          >
            {t === "playing" ? "Playing" : `Queue (${queue.length})`}
          </button>
        ))}
      </div>

      {tab === "playing" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-16">
          <div className="flex h-56 w-56 items-center justify-center overflow-hidden bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] sm:h-72 sm:w-72">
            {currentTrack.cover_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentTrack.cover_image}
                alt={currentTrack.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <Music size={56} className="text-white/30" />
            )}
          </div>

          <div className="text-center">
            <Link
              href={`/unreleased/${currentTrack.id}`}
              onClick={onClose}
              className="text-xl font-medium uppercase tracking-wide text-white transition hover:opacity-70 sm:text-2xl"
            >
              {currentTrack.title}
            </Link>
            <p className="mt-1 text-sm text-white/40">{ARTIST_NAME}</p>
          </div>

          <div className="flex w-full max-w-md items-center gap-2">
            <span className="text-[10px] tabular-nums text-white/40">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="h-1 w-full cursor-pointer accent-white"
            />
            <span className="text-[10px] tabular-nums text-white/40">
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button
              onClick={toggleShuffle}
              aria-pressed={shuffle}
              className={`p-2 transition hover:opacity-70 ${shuffle ? "text-white" : "text-white/40"}`}
            >
              <Shuffle size={18} />
            </button>
            <button onClick={playPrevious} className="p-2 text-white transition hover:opacity-70">
              <SkipBack size={20} fill="white" />
            </button>
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <span className="block h-3.5 w-3.5 animate-pulse rounded-full bg-black/50" />
              ) : isPlaying ? (
                <Pause size={26} fill="black" />
              ) : (
                <Play size={26} fill="black" className="ml-1" />
              )}
            </button>
            <button onClick={playNext} className="p-2 text-white transition hover:opacity-70">
              <SkipForward size={20} fill="white" />
            </button>
            <button
              onClick={cycleRepeat}
              className={`p-2 transition hover:opacity-70 ${
                repeatMode !== "off" ? "text-white" : "text-white/40"
              }`}
            >
              {repeatMode === "one" ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-16 sm:px-6">
          <div className="mx-auto flex max-w-md flex-col border-t border-white/10">
            {queue.map((track) => {
              const isActive = currentTrack.id === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className={`flex items-center gap-3 border-b border-white/10 px-1 py-3 text-left transition-colors ${
                    isActive ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden bg-white/5">
                    {track.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={track.cover_image}
                        alt={track.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Music size={16} className="text-white/30" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm tracking-tight ${
                        isActive ? "text-white" : "text-white/85"
                      }`}
                    >
                      {track.title}
                    </p>
                  </span>
                  <span className="text-xs tabular-nums text-white/40">
                    {formatTime(track.duration_seconds)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
