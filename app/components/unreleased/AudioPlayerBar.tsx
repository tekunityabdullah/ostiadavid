"use client";

import { useState } from "react";
import {
  ChevronUp,
  Music,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useUnreleasedPlayer } from "./PlayerProvider";
import { formatTime } from "./format";
import { ARTIST_NAME } from "./constants";
import NowPlayingOverlay from "./NowPlayingOverlay";

function VolumeIcon({ volume, muted }: { volume: number; muted: boolean }) {
  if (muted || volume === 0) return <VolumeX size={16} />;
  if (volume < 0.5) return <Volume1 size={16} />;
  return <Volume2 size={16} />;
}

export default function AudioPlayerBar() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    muted,
    shuffle,
    repeatMode,
    togglePlay,
    seekTo,
    changeVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    playNext,
    playPrevious,
    stop,
  } = useUnreleasedPlayer();

  const [showVolume, setShowVolume] = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 z-[150] flex w-full flex-col gap-2 border-t border-white/10 bg-black/90 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowNowPlaying(true)}
          aria-label="Open now playing"
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden bg-white/5 shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
            {currentTrack.cover_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentTrack.cover_image}
                alt={currentTrack.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <Music size={16} className="text-white/30" />
            )}
          </div>
          <span className="min-w-0">
            <p className="truncate text-xs uppercase tracking-tight text-white">
              {currentTrack.title}
            </p>
            <p className="truncate text-[11px] text-white/40">{ARTIST_NAME}</p>
          </span>
          <ChevronUp size={14} className="hidden shrink-0 text-white/30 sm:block" />
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={toggleShuffle}
            aria-label="Toggle shuffle"
            aria-pressed={shuffle}
            className={`hidden p-2 transition hover:opacity-70 sm:block ${
              shuffle ? "text-white" : "text-white/40"
            }`}
          >
            <Shuffle size={15} />
          </button>
          <button
            onClick={playPrevious}
            aria-label="Previous"
            className="p-2 text-white transition hover:opacity-70"
          >
            <SkipBack size={16} fill="white" />
          </button>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="p-2 text-white transition hover:opacity-70"
          >
            {isLoading ? (
              <span className="block h-5 w-5 animate-pulse rounded-full bg-white/40" />
            ) : isPlaying ? (
              <Pause size={22} fill="white" />
            ) : (
              <Play size={22} fill="white" />
            )}
          </button>
          <button
            onClick={playNext}
            aria-label="Next"
            className="p-2 text-white transition hover:opacity-70"
          >
            <SkipForward size={16} fill="white" />
          </button>
          <button
            onClick={cycleRepeat}
            aria-label="Toggle repeat"
            className={`hidden p-2 transition hover:opacity-70 sm:block ${
              repeatMode !== "off" ? "text-white" : "text-white/40"
            }`}
          >
            {repeatMode === "one" ? <Repeat1 size={15} /> : <Repeat size={15} />}
          </button>
        </div>

        <div
          className="relative hidden flex-1 items-center justify-end sm:flex"
          onMouseEnter={() => setShowVolume(true)}
          onMouseLeave={() => setShowVolume(false)}
        >
          <button
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="text-white/70 transition hover:text-white"
          >
            <VolumeIcon volume={volume} muted={muted} />
          </button>
          {showVolume && (
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              className="ml-2 h-1 w-20 cursor-pointer accent-white"
            />
          )}
        </div>

        <button
          onClick={stop}
          aria-label="Close player"
          className="shrink-0 p-2 text-white/40 transition hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2">
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

      {showNowPlaying && <NowPlayingOverlay onClose={() => setShowNowPlaying(false)} />}
    </div>
  );
}
