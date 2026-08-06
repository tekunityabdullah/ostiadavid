"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  Download,
  ImageIcon,
  Pause,
  Play,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import type { UnreleasedMediaSummary } from "@/lib/types";
import { useUnreleasedPlayer } from "./PlayerProvider";
import { useLikedMedia } from "./useLikedMedia";
import AudioTrackList from "./AudioTrackList";
import VideoGrid from "./VideoGrid";
import WaveformIcon from "./WaveformIcon";
import { formatTime } from "./format";

interface MediaDetailProps {
  item: UnreleasedMediaSummary;
  related: UnreleasedMediaSummary[];
  initialStreamUrl?: string | null;
}

export default function MediaDetail({ item, related, initialStreamUrl }: MediaDetailProps) {
  const { liked, toggleLike } = useLikedMedia();

  return (
    <div className="w-full max-w-[900px]">
      <Link
        href="/unreleased"
        className="mb-8 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-white/40 transition hover:text-white"
      >
        <ChevronLeft size={14} />
        Unreleased
      </Link>

      {item.media_type === "video" ? (
        <VideoDetail item={item} initialUrl={initialStreamUrl ?? null} />
      ) : item.media_type === "image" ? (
        <ImageDetail item={item} initialUrl={initialStreamUrl ?? null} />
      ) : (
        <AudioDetail item={item} />
      )}

      {related.length > 0 && (
        <section className={item.media_type === "video" ? "mt-10" : "mt-16"}>
          {item.media_type !== "video" && (
            <h2 className="mb-4 px-1 text-sm font-medium uppercase tracking-[0.15em] text-white">
              {item.media_type === "image" ? "More Images" : "More Tracks"}
            </h2>
          )}
          {item.media_type === "video" ? (
            <VideoGrid videos={related} likedIds={liked} onToggleLike={toggleLike} twoColumn />
          ) : item.media_type === "image" ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {related.map((img) => (
                <Link
                  key={img.id}
                  href={`/unreleased/${img.id}`}
                  className="group flex aspect-square items-center justify-center overflow-hidden border border-white/15 bg-white/5"
                >
                  {img.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.cover_image}
                      alt={img.title}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                    />
                  ) : (
                    <ImageIcon size={32} className="text-white/30" />
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <AudioTrackList tracks={related} likedIds={liked} onToggleLike={toggleLike} />
          )}
        </section>
      )}
    </div>
  );
}

function AudioDetail({ item }: { item: UnreleasedMediaSummary }) {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    shuffle,
    playTrack,
    seekTo,
    toggleShuffle,
    playNext,
    playPrevious,
  } = useUnreleasedPlayer();

  const isActive = currentTrack?.id === item.id;
  const displayTime = isActive ? currentTime : 0;
  const displayDuration = isActive ? duration : item.duration_seconds ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 pt-2">
      <div className="flex h-56 w-56 items-center justify-center overflow-hidden bg-white/5 sm:h-64 sm:w-64">
        {item.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.cover_image} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <WaveformIcon size={110} className="text-white/25" />
        )}
      </div>

      <div className="flex w-full justify-end">
        <button
          onClick={toggleShuffle}
          aria-pressed={shuffle}
          aria-label="Shuffle"
          className={`-mb-3 p-1.5 transition hover:opacity-80 ${
            shuffle ? "text-white" : "text-white/40"
          }`}
        >
          <Shuffle size={18} />
        </button>
      </div>

      <h1 className="w-full text-left text-lg font-medium uppercase tracking-wide text-white sm:text-xl">
        {item.title}
      </h1>

      <div className="flex w-full items-center gap-3">
        <span className="w-8 shrink-0 text-[10px] tabular-nums text-white/40">
          {formatTime(displayTime)}
        </span>
        <input
          type="range"
          min={0}
          max={displayDuration || 0}
          value={displayTime}
          onChange={(e) => {
            if (!isActive) playTrack(item);
            seekTo(Number(e.target.value));
          }}
          className="h-1 w-full cursor-pointer accent-white"
        />
        <span className="w-8 shrink-0 text-right text-[10px] tabular-nums text-white/40">
          {formatTime(displayDuration)}
        </span>
      </div>

      <div className="flex items-center gap-7">
        <button
          onClick={() => isActive && playPrevious()}
          aria-label="Previous"
          className="p-2 text-white/70 transition hover:text-white"
        >
          <SkipBack size={20} fill="currentColor" />
        </button>
        <button
          onClick={() => playTrack(item)}
          aria-label={isActive && isPlaying ? "Pause" : "Play"}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-[0_8px_30px_rgba(255,255,255,0.15)] transition hover:scale-105 active:scale-95"
        >
          {isActive && isLoading ? (
            <span className="block h-3 w-3 animate-pulse rounded-full bg-black/50" />
          ) : isActive && isPlaying ? (
            <Pause size={22} fill="black" />
          ) : (
            <Play size={22} fill="black" className="ml-1" />
          )}
        </button>
        <button
          onClick={() => isActive && playNext()}
          aria-label="Next"
          className="p-2 text-white/70 transition hover:text-white"
        >
          <SkipForward size={20} fill="currentColor" />
        </button>
      </div>

      <button
        type="button"
        className="mt-1 text-xs uppercase tracking-[0.3em] text-white underline underline-offset-4 transition hover:text-white/70"
      >
        Add to Cart
      </button>
    </div>
  );
}

function VideoDetail({ item, initialUrl }: { item: UnreleasedMediaSummary; initialUrl: string | null }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
      return;
    }

    let cancelled = false;

    fetch("/api/unreleased/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load stream");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setUrl(data.url);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [item.id, initialUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(0, video.currentTime + seconds), video.duration || 0);
  };

  const remaining = Math.max(0, (duration || 0) - currentTime);

  return (
    <div>
      <div className="relative">
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-white/5">
          {error ? (
            <p className="text-sm uppercase tracking-tight text-white/50">Failed to load video.</p>
          ) : url ? (
            <>
              <video
                ref={videoRef}
                src={url}
                autoPlay
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
                className="h-full w-full cursor-pointer"
              />

              {/* Title overlay */}
              <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-4 py-3">
                <p className="text-sm font-medium uppercase tracking-wide text-white sm:text-base">
                  {item.title}
                </p>
              </div>

              {/* Floating control card, centered within the video like the reference design */}
              <div className="absolute bottom-3 left-1/2 w-[70%] max-w-xs -translate-x-1/2 rounded-md bg-white px-3 py-2 sm:bottom-4">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] tabular-nums text-black/60">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime}
                    onChange={(e) => {
                      const video = videoRef.current;
                      if (video) video.currentTime = Number(e.target.value);
                      setCurrentTime(Number(e.target.value));
                    }}
                    className="h-1 w-full cursor-pointer accent-black"
                  />
                  <span className="text-[9px] tabular-nums text-black/60">
                    -{formatTime(remaining)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-center gap-5">
                  <button
                    onClick={() => skip(-10)}
                    aria-label="Back 10 seconds"
                    className="text-black/70 transition hover:text-black"
                  >
                    <SkipBack size={14} fill="currentColor" />
                  </button>
                  <button
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    className="text-black transition hover:opacity-70"
                  >
                    {isPlaying ? (
                      <Pause size={16} fill="black" />
                    ) : (
                      <Play size={16} fill="black" className="ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={() => skip(10)}
                    aria-label="Forward 10 seconds"
                    className="text-black/70 transition hover:text-black"
                  >
                    <SkipForward size={14} fill="currentColor" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm uppercase tracking-tight text-white/50">Loading...</p>
          )}
        </div>

        {/* Download icon, in line with the control card's bottom edge */}
        {url && !error && (
          <a
            href={url}
            download
            aria-label="Download video"
            className="absolute bottom-3 right-3 text-white/80 transition hover:text-white sm:bottom-4 sm:right-4"
          >
            <Download size={22} strokeWidth={1.5} />
          </a>
        )}
      </div>
    </div>
  );
}

function ImageDetail({ item, initialUrl }: { item: UnreleasedMediaSummary; initialUrl: string | null }) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
      return;
    }

    let cancelled = false;

    fetch("/api/unreleased/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load image");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setUrl(data.url);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [item.id, initialUrl]);

  return (
    <div>
      <div className="mb-4 flex min-h-[300px] w-full items-center justify-center overflow-hidden bg-white/5">
        {error ? (
          <p className="text-sm uppercase tracking-tight text-white/50">Failed to load image.</p>
        ) : url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={item.title} className="max-h-[70vh] w-full object-contain" />
        ) : (
          <p className="text-sm uppercase tracking-tight text-white/50">Loading...</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-medium uppercase tracking-wide text-white sm:text-xl">
          {item.title}
        </h1>
        {url && !error && (
          <a
            href={url}
            download
            className="inline-flex shrink-0 items-center gap-2 text-xs uppercase tracking-[0.3em] text-white underline underline-offset-4 transition hover:text-white/70"
          >
            <Download size={14} />
            Download
          </a>
        )}
      </div>

      {item.description && (
        <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/50">{item.description}</p>
      )}
    </div>
  );
}
