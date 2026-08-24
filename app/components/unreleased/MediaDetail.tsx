"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  Download,
  ImageIcon,
  Maximize,
  Minimize,
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
import { getYouTubeEmbedUrl } from "./youtube";
import { ARTIST_NAME } from "./constants";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

const FALLBACK_ARTWORK = "/audio-placeholder.png";

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
        href="/exclusive?tab=unreleased"
        className="mb-8 inline-flex items-center gap-1 font-sans text-[11px] uppercase text-white/40 transition hover:text-white"
      >
        <ChevronLeft size={14} />
        Unreleased
      </Link>

      {item.media_type === "video" ? (
        item.youtube_url ? (
          <YouTubeVideoDetail item={item} />
        ) : (
          <VideoDetail item={item} initialUrl={initialStreamUrl ?? null} />
        )
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
            <VideoGrid videos={related} twoColumn hideActions />
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
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (item.price == null) return;
    addItem({
      productId: item.id,
      variantId: null,
      variantLabel: null,
      name: item.title,
      price: item.price,
      image: item.cover_image ?? FALLBACK_ARTWORK,
      isDigital: true,
      isExclusive: true,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isActive = currentTrack?.id === item.id;
  const displayTime = isActive ? currentTime : 0;
  const displayDuration = isActive ? duration : item.duration_seconds ?? 0;
  const progressPercent = displayDuration ? (displayTime / displayDuration) * 100 : 0;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 pt-2">
      <div className="flex h-56 w-56 items-center justify-center overflow-hidden bg-white/5 sm:h-64 sm:w-64">
        {item.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.cover_image} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <WaveformIcon fill />
        )}
      </div>

      <div className="flex w-full items-center justify-between">
        <h1 className="text-left text-lg font-medium uppercase tracking-wide text-white sm:text-xl">
          {item.title}
        </h1>
        <button
          onClick={toggleShuffle}
          aria-pressed={shuffle}
          aria-label="Shuffle"
          className={`shrink-0 p-1.5 transition hover:opacity-80 ${
            shuffle ? "text-white" : "text-white/40"
          }`}
        >
          <Shuffle size={18} />
        </button>
      </div>

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
          className="slim-range w-full text-white"
          style={{
            background: `linear-gradient(to right, white ${progressPercent}%, rgba(255,255,255,0.25) ${progressPercent}%)`,
          }}
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
          className="p-2 text-white transition hover:opacity-70"
        >
          {isActive && isLoading ? (
            <span className="block h-5 w-5 animate-pulse rounded-full bg-white/40" />
          ) : isActive && isPlaying ? (
            <Pause size={28} fill="white" />
          ) : (
            <Play size={28} fill="white" />
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

      {item.price != null && (
        <div className="flex w-full items-center justify-between gap-4">
          <p className="text-sm font-medium text-white">{formatPrice(item.price)}</p>
          <div className="flex items-center gap-4">
            <Link
              href="/cart?scope=exclusive"
              className="text-xs uppercase tracking-tight text-white/50 transition hover:text-white"
            >
              View Cart
            </Link>
            <button
              type="button"
              onClick={handleAddToCart}
              className="text-xs font-medium uppercase tracking-tight text-white transition hover:opacity-70"
            >
              {added ? "Added to Cart" : "Add to Cart"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function YouTubeVideoDetail({ item }: { item: UnreleasedMediaSummary }) {
  const embedUrl = item.youtube_url ? getYouTubeEmbedUrl(item.youtube_url) : null;

  return (
    <div>
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-white/5">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        ) : (
          <p className="text-sm uppercase tracking-tight text-white/50">Invalid YouTube link.</p>
        )}
      </div>

      <h1 className="mt-4 text-lg font-medium uppercase tracking-wide text-white sm:text-xl">
        {item.title}
      </h1>
      {item.description && (
        <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/50">{item.description}</p>
      )}
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

  // YouTube-style controls: tapping the video toggles whether the overlay
  // (title, progress card, fullscreen button) is shown — it never
  // pauses/plays. Only the dedicated play/pause button does that. While
  // playing, the overlay auto-hides after a few seconds like a real
  // player; while paused, it always stays visible.
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const scheduleAutoHide = () => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
  };

  useEffect(() => clearHideTimer, []);

  // Audio and video are never allowed to play at once: starting this video
  // pauses the global audio player, and if audio is resumed elsewhere (the
  // sticky bottom bar persists across pages) while this video is playing,
  // this video gets paused in turn.
  const { isPlaying: audioIsPlaying, pause: pauseAudio } = useUnreleasedPlayer();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (item.price == null) return;
    addItem({
      productId: item.id,
      variantId: null,
      variantLabel: null,
      name: item.title,
      price: item.price,
      image: item.cover_image ?? "",
      isDigital: true,
      isExclusive: true,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  useEffect(() => {
    if (audioIsPlaying) {
      videoRef.current?.pause();
    }
  }, [audioIsPlaying]);

  // Same OS/browser-level "Now Playing" widget treatment as the audio
  // player (see PlayerProvider) — real title + artwork, no default
  // 10-second skip buttons.
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: item.title,
      artist: ARTIST_NAME,
      artwork: [
        { src: item.cover_image || FALLBACK_ARTWORK, sizes: "512x512", type: "image/png" },
      ],
    });
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

    navigator.mediaSession.setActionHandler("play", () => videoRef.current?.play());
    navigator.mediaSession.setActionHandler("pause", () => videoRef.current?.pause());
    navigator.mediaSession.setActionHandler("seekbackward", null);
    navigator.mediaSession.setActionHandler("seekforward", null);
    navigator.mediaSession.setActionHandler("previoustrack", null);
    navigator.mediaSession.setActionHandler("nexttrack", null);

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
    };
  }, [item.title, item.cover_image, isPlaying]);

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

  // Tapping the video itself only shows/hides the overlay — it never
  // touches playback.
  const handleVideoTap = () => {
    setControlsVisible((prev) => {
      const next = !prev;
      if (next && isPlaying) scheduleAutoHide();
      else clearHideTimer();
      return next;
    });
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(0, video.currentTime + seconds), video.duration || 0);
  };

  // "Fullscreen" is our own CSS-driven overlay, not the browser/OS's native
  // fullscreen video player — the native one (requestFullscreen /
  // webkitEnterFullscreen) hands the whole screen over to the OS's own
  // chrome (volume slider, AirPlay, PiP, a "..." menu, its own close
  // button), replacing our custom title/controls entirely. This instead
  // just expands the same video + the same title/control-card/button
  // this component already renders to cover the viewport, so nothing
  // outside our own UI ever shows up.
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => setIsFullscreen((v) => !v);

  useEffect(() => {
    if (!isFullscreen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isFullscreen]);

  const remaining = Math.max(0, (duration || 0) - currentTime);
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div>
      <div
        className={
          isFullscreen
            ? "fixed inset-0 z-300 flex items-center justify-center bg-black"
            : "relative flex aspect-video w-full items-center justify-center overflow-hidden bg-white/5"
        }
      >
          {error ? (
            <p className="text-sm uppercase tracking-tight text-white/50">Failed to load video.</p>
          ) : url ? (
            <>
              <video
                ref={videoRef}
                src={url}
                autoPlay
                playsInline
                onClick={handleVideoTap}
                onPlay={() => {
                  setIsPlaying(true);
                  pauseAudio();
                  scheduleAutoHide();
                }}
                onPause={() => {
                  setIsPlaying(false);
                  setControlsVisible(true);
                  clearHideTimer();
                }}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                disableRemotePlayback
                onContextMenu={(e) => e.preventDefault()}
                className="h-full w-full cursor-pointer object-contain"
              />

              {/* Title overlay, only while the controls are shown */}
              <div
                className={`pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-4 py-3 transition-opacity duration-300 ${
                  controlsVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                <p className="text-sm font-medium uppercase tracking-wide text-white sm:text-base">
                  {item.title}
                </p>
              </div>

              {/* Floating control card, centered within the video like the reference design — a translucent dark pill, not a solid white block, so it sits on the video instead of standing out as a box. */}
              <div
                className={`absolute bottom-3 left-1/2 w-[55%] max-w-[200px] -translate-x-1/2 rounded-md bg-black/50 px-2.5 py-1.5 backdrop-blur-sm transition-opacity duration-300 sm:bottom-4 ${
                  controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] tabular-nums text-white/70">
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
                    className="slim-range w-full text-white"
                    style={{
                      background: `linear-gradient(to right, white ${progressPercent}%, rgba(255,255,255,0.3) ${progressPercent}%)`,
                    }}
                  />
                  <span className="text-[8px] tabular-nums text-white/70">
                    -{formatTime(remaining)}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center justify-center gap-3">
                  <button
                    onClick={() => skip(-10)}
                    aria-label="Back 10 seconds"
                    className="text-white/70 transition hover:text-white"
                  >
                    <SkipBack size={11} fill="currentColor" />
                  </button>
                  <button
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    className="text-white transition hover:opacity-70"
                  >
                    {isPlaying ? (
                      <Pause size={13} fill="white" />
                    ) : (
                      <Play size={13} fill="white" className="ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={() => skip(10)}
                    aria-label="Forward 10 seconds"
                    className="text-white/70 transition hover:text-white"
                  >
                    <SkipForward size={11} fill="currentColor" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm uppercase tracking-tight text-white/50">Loading...</p>
          )}

          {/* Fullscreen toggle, in line with the control card's bottom edge —
              same button, same icon slot, in both modes; just swaps to a
              minimize icon and exits our own overlay instead of the OS's. */}
          {url && !error && (
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              className={`absolute bottom-3 right-3 text-white/80 transition-opacity duration-300 hover:text-white sm:bottom-4 sm:right-4 ${
                controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              {isFullscreen ? (
                <Minimize size={22} strokeWidth={1.5} />
              ) : (
                <Maximize size={22} strokeWidth={1.5} />
              )}
            </button>
          )}
      </div>

      {item.price != null && (
        <div className="mt-4 flex w-full items-center justify-between gap-4">
          <p className="text-sm font-medium text-white">{formatPrice(item.price)}</p>
          <div className="flex items-center gap-4">
            <Link
              href="/cart?scope=exclusive"
              className="text-xs uppercase tracking-tight text-white/50 transition hover:text-white"
            >
              View Cart
            </Link>
            <button
              type="button"
              onClick={handleAddToCart}
              className="text-xs font-medium uppercase tracking-tight text-white transition hover:opacity-70"
            >
              {added ? "Added to Cart" : "Add to Cart"}
            </button>
          </div>
        </div>
      )}
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
