"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, Heart, Music, Pause, Play } from "lucide-react";
import type { UnreleasedMediaSummary } from "@/lib/types";
import { useUnreleasedPlayer } from "./PlayerProvider";
import { useLikedMedia } from "./useLikedMedia";
import AudioTrackList from "./AudioTrackList";
import VideoGrid from "./VideoGrid";
import AddToPlaylistMenu from "./AddToPlaylistMenu";
import { formatCount } from "./format";
import { ARTIST_NAME } from "./constants";

interface MediaDetailProps {
  item: UnreleasedMediaSummary;
  related: UnreleasedMediaSummary[];
  initialStreamUrl?: string | null;
}

function LikeButton({ liked, onToggle }: { liked: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={liked}
      className={`inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] transition hover:text-white ${
        liked ? "text-white" : "text-white/40"
      }`}
    >
      <Heart size={14} fill={liked ? "white" : "none"} />
      {liked ? "Liked" : "Like"}
    </button>
  );
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
        <VideoDetail
          item={item}
          liked={liked.has(item.id)}
          onToggleLike={() => toggleLike(item.id)}
          initialUrl={initialStreamUrl ?? null}
        />
      ) : (
        <AudioDetail item={item} liked={liked.has(item.id)} onToggleLike={() => toggleLike(item.id)} />
      )}

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 px-1 text-sm font-medium uppercase tracking-[0.15em] text-white">
            {item.media_type === "video" ? "More Videos" : "More Tracks"}
          </h2>
          {item.media_type === "video" ? (
            <VideoGrid videos={related} likedIds={liked} onToggleLike={toggleLike} />
          ) : (
            <AudioTrackList tracks={related} likedIds={liked} onToggleLike={toggleLike} />
          )}
        </section>
      )}
    </div>
  );
}

function AudioDetail({
  item,
  liked,
  onToggleLike,
}: {
  item: UnreleasedMediaSummary;
  liked: boolean;
  onToggleLike: () => void;
}) {
  const { currentTrack, isPlaying, isLoading, playTrack } = useUnreleasedPlayer();
  const isActive = currentTrack?.id === item.id;

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex h-48 w-48 items-center justify-center overflow-hidden bg-white/5 sm:h-56 sm:w-56">
        {item.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.cover_image} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <Music size={48} className="text-white/30" />
        )}
      </div>

      <div>
        <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">
          Unreleased Track
        </span>
        <h1 className="mt-2 text-2xl font-medium uppercase tracking-wide text-white sm:text-3xl">
          {item.title}
        </h1>
        <Link
          href="/unreleased"
          className="mt-2 inline-block text-sm text-white/60 transition hover:text-white hover:underline"
        >
          {ARTIST_NAME}
        </Link>
        <p className="mt-1 text-xs text-white/40">
          {formatCount(item.play_count)} {item.play_count === 1 ? "stream" : "streams"}
        </p>
      </div>

      {item.description && (
        <p className="max-w-md text-xs leading-relaxed text-white/50">{item.description}</p>
      )}

      <div className="mt-2 flex items-center gap-6">
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
        <LikeButton liked={liked} onToggle={onToggleLike} />
        <AddToPlaylistMenu mediaId={item.id} label="Playlist" />
      </div>
    </div>
  );
}

function VideoDetail({
  item,
  liked,
  onToggleLike,
  initialUrl,
}: {
  item: UnreleasedMediaSummary;
  liked: boolean;
  onToggleLike: () => void;
  initialUrl: string | null;
}) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Server already resolved the URL for the initial render — only fall
    // back to a client fetch if that failed (or for a future item.id).
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

  return (
    <div>
      <div className="mb-6 flex aspect-video w-full items-center justify-center overflow-hidden bg-white/5">
        {error ? (
          <p className="text-sm uppercase tracking-tight text-white/50">Failed to load video.</p>
        ) : url ? (
          <video
            src={url}
            controls
            autoPlay
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            className="h-full w-full"
          />
        ) : (
          <p className="text-sm uppercase tracking-tight text-white/50">Loading...</p>
        )}
      </div>

      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-xl font-medium uppercase tracking-wide text-white sm:text-2xl">
            {item.title}
          </h1>
          <Link
            href="/unreleased"
            className="mt-1 inline-block text-sm text-white/60 transition hover:text-white hover:underline"
          >
            {ARTIST_NAME}
          </Link>
          <p className="mt-1 text-xs text-white/40">
            {formatCount(item.play_count)} {item.play_count === 1 ? "view" : "views"}
          </p>
          {item.description && (
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/50">
              {item.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3">
          <LikeButton liked={liked} onToggle={onToggleLike} />
          <AddToPlaylistMenu mediaId={item.id} label="Playlist" />
        </div>
      </div>
    </div>
  );
}
