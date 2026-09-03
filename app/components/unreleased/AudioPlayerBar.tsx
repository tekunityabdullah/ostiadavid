"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
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
import WaveformIcon from "./WaveformIcon";

function VolumeIcon({ volume, muted }: { volume: number; muted: boolean }) {
  if (muted || volume === 0) return <VolumeX size={16} />;
  if (volume < 0.5) return <Volume1 size={16} />;
  return <Volume2 size={16} />;
}

const EDGE_MARGIN = 16; // px from the true viewport edge to the bar's near edge

type BarPosition = { x: number; y: number };

// Finds the point on the (inset) viewport border nearest to an arbitrary
// point — used so the bar's center can only ever land on an edge or corner,
// never drift into the open middle of the screen, however it's dragged.
function nearestPerimeterPoint(px: number, py: number, rect: { left: number; right: number; top: number; bottom: number }): BarPosition {
  const clampedX = Math.min(Math.max(px, rect.left), rect.right);
  const clampedY = Math.min(Math.max(py, rect.top), rect.bottom);
  const wasOutside = px < rect.left || px > rect.right || py < rect.top || py > rect.bottom;

  if (wasOutside) {
    // Clamping alone already pinned it to the border.
    return { x: clampedX, y: clampedY };
  }

  // Pointer is inside the rect — snap whichever axis is closer to its edge.
  const distLeft = clampedX - rect.left;
  const distRight = rect.right - clampedX;
  const distTop = clampedY - rect.top;
  const distBottom = rect.bottom - clampedY;
  const minDist = Math.min(distLeft, distRight, distTop, distBottom);

  if (minDist === distLeft) return { x: rect.left, y: clampedY };
  if (minDist === distRight) return { x: rect.right, y: clampedY };
  if (minDist === distTop) return { x: clampedX, y: rect.top };
  return { x: clampedX, y: rect.bottom };
}

// Buttons, links, and the range sliders need normal clicks/drags to keep
// working — only a pointerdown that starts outside all of those should
// pick the bar up and start moving it.
function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("button, a, input"));
}

// Shared edge/corner-drag mechanics — used separately for the full bar
// (desktop only) and the minimized card (mobile only), each with its own
// remembered position so the two never interfere with each other.
function useEdgeDrag(enabled: boolean, storageKey: string) {
  const [position, setPosition] = useState<BarPosition | null>(null);
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const dragOffsetRef = useRef({ dx: 0, dy: 0 });
  const halfSizeRef = useRef({ halfWidth: 0, halfHeight: 0 });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setPosition(JSON.parse(raw));
    } catch {
      // ignore — falls back to the default pinned position
    }
  }, [storageKey]);

  const handleDragStart = (e: React.PointerEvent) => {
    if (!enabled || !ref.current || isInteractiveTarget(e.target)) return;
    const rect = ref.current.getBoundingClientRect();
    halfSizeRef.current = { halfWidth: rect.width / 2, halfHeight: rect.height / 2 };
    dragOffsetRef.current = {
      dx: e.clientX - (rect.left + rect.width / 2),
      dy: e.clientY - (rect.top + rect.height / 2),
    };
    setDragging(true);
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };

  const handleDragMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const { halfWidth, halfHeight } = halfSizeRef.current;
    const rect = {
      left: EDGE_MARGIN + halfWidth,
      right: window.innerWidth - EDGE_MARGIN - halfWidth,
      top: EDGE_MARGIN + halfHeight,
      bottom: window.innerHeight - EDGE_MARGIN - halfHeight,
    };
    const targetX = e.clientX - dragOffsetRef.current.dx;
    const targetY = e.clientY - dragOffsetRef.current.dy;
    setPosition(nearestPerimeterPoint(targetX, targetY, rect));
  };

  const handleDragEnd = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragging(false);
    (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    setPosition((current) => {
      try {
        if (current) localStorage.setItem(storageKey, JSON.stringify(current));
      } catch {
        // ignore — position just won't persist across reloads
      }
      return current;
    });
  };

  const style: React.CSSProperties =
    enabled && position
      ? { left: position.x, top: position.y, right: "auto", bottom: "auto", transform: "translate(-50%, -50%)" }
      : {};

  return { ref, position, dragging, style, handleDragStart, handleDragMove, handleDragEnd };
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
  // Collapses the bar down to just cover art + play/pause — playback keeps
  // going the whole time, this is purely a "get it out of the way" toggle.
  const [minimized, setMinimized] = useState(false);
  const pathname = usePathname();

  // The track's own detail page already has a full player of its own — the
  // sticky bar is only useful for getting back to it from elsewhere, so it
  // hides itself while you're actually looking at that page.
  const isOnTrackPage = currentTrack && pathname === `/unreleased/${currentTrack.id}`;

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Full bar: draggable on desktop only, along edges/corners.
  const expandedDrag = useEdgeDrag(isDesktop, "osita-player-bar-position");
  // Minimized card: draggable on mobile only, along edges/corners — its
  // own separate remembered position so it never jumps to wherever the
  // full bar was last dragged (or vice versa).
  const minimizedDrag = useEdgeDrag(!isDesktop, "osita-player-mini-position");

  if (!currentTrack || isOnTrackPage) return null;

  // Minimized: a small square card (cover art + title, like a grid tile)
  // instead of the full bar — playback keeps going the whole time, this is
  // purely a "get it out of the way" state. The chevron is the only way
  // back to the full bar; tapping the card itself goes to the track's page.
  if (minimized) {
    return (
      <div
        ref={minimizedDrag.ref}
        style={minimizedDrag.style}
        onPointerDown={minimizedDrag.handleDragStart}
        onPointerMove={minimizedDrag.handleDragMove}
        onPointerUp={minimizedDrag.handleDragEnd}
        className={`fixed z-150 flex items-start gap-0.5 ${
          !isDesktop ? (minimizedDrag.dragging ? "cursor-grabbing" : "cursor-grab") : ""
        } ${!isDesktop && minimizedDrag.position ? "" : "bottom-3 right-3"}`}
      >
        {/* Centered against just the image box (h-20), not the whole card
            — the title line below the image would otherwise pull a
            plain items-center alignment down off the image's true center. */}
        <div className="flex h-20 shrink-0 items-center">
          <button
            onClick={() => setMinimized(false)}
            aria-label="Expand player"
            className="p-1.5 text-white transition hover:opacity-70"
          >
            <ChevronLeft size={26} />
          </button>
        </div>

        <Link
          href={`/unreleased/${currentTrack.id}`}
          aria-label={`Go to ${currentTrack.title}`}
          className="flex w-24 flex-col items-center gap-1.5"
        >
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-black/90 backdrop-blur-md">
            {currentTrack.cover_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentTrack.cover_image}
                alt={currentTrack.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <WaveformIcon fill />
            )}
          </div>
          <p className="w-full truncate text-center text-[10px] uppercase tracking-tight text-white">
            {currentTrack.title}
          </p>
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={expandedDrag.ref}
      style={expandedDrag.style}
      onPointerDown={expandedDrag.handleDragStart}
      onPointerMove={expandedDrag.handleDragMove}
      onPointerUp={expandedDrag.handleDragEnd}
      className={`fixed z-150 flex items-center gap-0.5 ${
        isDesktop ? (expandedDrag.dragging ? "cursor-grabbing" : "cursor-grab") : ""
      } ${isDesktop && expandedDrag.position ? "" : "inset-x-0 bottom-3 justify-center"}`}
    >
      <button
        onClick={() => setMinimized(true)}
        aria-label="Minimize player"
        className="shrink-0 p-1 text-white transition hover:opacity-70"
      >
        <ChevronRight size={26} />
      </button>

      <div className="flex w-[80%] max-w-sm flex-col gap-2 rounded-lg border border-white/10 bg-black/90 px-3 py-2.5 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          href={`/unreleased/${currentTrack.id}`}
          aria-label={`Go to ${currentTrack.title}`}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden bg-white/5 shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
            {currentTrack.cover_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentTrack.cover_image}
                alt={currentTrack.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <WaveformIcon fill />
            )}
          </div>
          <span className="min-w-0">
            <p className="truncate text-xs uppercase tracking-tight text-white">
              {currentTrack.title}
            </p>
          </span>
        </Link>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            onClick={toggleShuffle}
            aria-label="Toggle shuffle"
            aria-pressed={shuffle}
            className={`hidden p-1.5 transition hover:opacity-70 sm:block ${
              shuffle ? "text-white" : "text-white/40"
            }`}
          >
            <Shuffle size={13} />
          </button>
          <button
            onClick={playPrevious}
            aria-label="Previous"
            className="p-1.5 text-white transition hover:opacity-70"
          >
            <SkipBack size={14} fill="white" />
          </button>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="p-1.5 text-white transition hover:opacity-70"
          >
            {isLoading ? (
              <span className="block h-4 w-4 animate-pulse rounded-full bg-white/40" />
            ) : isPlaying ? (
              <Pause size={18} fill="white" />
            ) : (
              <Play size={18} fill="white" />
            )}
          </button>
          <button
            onClick={playNext}
            aria-label="Next"
            className="p-1.5 text-white transition hover:opacity-70"
          >
            <SkipForward size={14} fill="white" />
          </button>
          <button
            onClick={cycleRepeat}
            aria-label="Toggle repeat"
            className={`hidden p-1.5 transition hover:opacity-70 sm:block ${
              repeatMode !== "off" ? "text-white" : "text-white/40"
            }`}
          >
            {repeatMode === "one" ? <Repeat1 size={13} /> : <Repeat size={13} />}
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
              className="slim-range ml-2 w-20 text-white"
              style={{
                background: `linear-gradient(to right, white ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.25) ${(muted ? 0 : volume) * 100}%)`,
              }}
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
          className="slim-range w-full text-white"
          style={{
            background: `linear-gradient(to right, white ${
              duration ? (currentTime / duration) * 100 : 0
            }%, rgba(255,255,255,0.25) ${duration ? (currentTime / duration) * 100 : 0}%)`,
          }}
        />
        <span className="text-[10px] tabular-nums text-white/40">
          {formatTime(duration)}
        </span>
      </div>
      </div>
    </div>
  );
}
