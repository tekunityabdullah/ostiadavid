"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Disc3, ListMusic, Search } from "lucide-react";
import type { UnreleasedMediaSummary } from "@/lib/types";
import AudioTrackList from "./AudioTrackList";
import VideoGrid from "./VideoGrid";
import { useLikedMedia } from "./useLikedMedia";
import { getRecentlyPlayedIds } from "./recentlyPlayed";

type Filter = "all" | "audio" | "video" | "liked";

export default function MediaLibrary({ media }: { media: UnreleasedMediaSummary[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const { liked, toggleLike } = useLikedMedia();
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    setRecentIds(getRecentlyPlayedIds());
  }, [media]);

  const normalizedQuery = query.trim().toLowerCase();

  const matchesQuery = (item: UnreleasedMediaSummary) =>
    !normalizedQuery || item.title.toLowerCase().includes(normalizedQuery);

  const byFilter = useMemo(() => {
    if (filter === "liked") return media.filter((m) => liked.has(m.id));
    return media;
  }, [media, filter, liked]);

  const audioTracks = useMemo(
    () => byFilter.filter((m) => m.media_type === "audio" && matchesQuery(m)),
    [byFilter, normalizedQuery]
  );
  const videos = useMemo(
    () => byFilter.filter((m) => m.media_type === "video" && matchesQuery(m)),
    [byFilter, normalizedQuery]
  );

  const recentItems = useMemo(
    () =>
      recentIds
        .map((id) => media.find((m) => m.id === id))
        .filter((m): m is UnreleasedMediaSummary => Boolean(m)),
    [recentIds, media]
  );

  const showAudio = filter !== "video" && audioTracks.length > 0;
  const showVideo = filter !== "audio" && videos.length > 0;
  const showRecent =
    filter === "all" && !normalizedQuery && recentItems.length > 0;

  return (
    <div className="w-full max-w-[900px] pb-28">
      <div className="mx-auto mb-4 flex max-w-lg items-center gap-2 border border-white/15 px-3 py-2 focus-within:border-white/40">
        <Search size={14} className="shrink-0 text-white/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search unreleased..."
          className="w-full bg-transparent text-xs uppercase tracking-tight text-white outline-none placeholder:text-white/30"
        />
      </div>

      <div className="mx-auto mb-8 flex max-w-lg items-center justify-center gap-2">
        <Link
          href="/unreleased/albums"
          className="flex flex-1 items-center justify-center gap-2 border border-white/15 px-3 py-2 text-xs uppercase tracking-tight text-white/60 transition hover:border-white/40 hover:text-white"
        >
          <Disc3 size={14} />
          Albums
        </Link>
        <Link
          href="/unreleased/playlists"
          className="flex flex-1 items-center justify-center gap-2 border border-white/15 px-3 py-2 text-xs uppercase tracking-tight text-white/60 transition hover:border-white/40 hover:text-white"
        >
          <ListMusic size={14} />
          Playlists
        </Link>
      </div>

      <div className="mb-10 flex flex-wrap justify-center gap-2 text-[11px]">
        {(["all", "audio", "video", "liked"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`border px-4 py-1.5 uppercase tracking-[0.15em] transition ${
              filter === f
                ? "border-white bg-white text-black"
                : "border-white/20 text-white/50 hover:border-white/40 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {showRecent && (
        <section className="mb-14">
          <h2 className="mb-4 px-1 text-sm font-medium uppercase tracking-[0.15em] text-white">
            Recently Played
          </h2>
          <AudioTrackList
            tracks={recentItems.filter((m) => m.media_type === "audio")}
            likedIds={liked}
            onToggleLike={toggleLike}
          />
          <VideoGrid
            videos={recentItems.filter((m) => m.media_type === "video")}
            likedIds={liked}
            onToggleLike={toggleLike}
          />
        </section>
      )}

      {!showAudio && !showVideo ? (
        <p className="py-12 text-center text-sm uppercase tracking-tight text-white/50">
          {normalizedQuery
            ? "No matches for that search."
            : filter === "liked"
              ? "Nothing liked yet — tap the heart on a track or video."
              : "No unreleased media in this category yet."}
        </p>
      ) : (
        <div className="grid gap-14">
          {showAudio && (
            <section>
              {filter === "all" && (
                <h2 className="mb-4 px-1 text-sm font-medium uppercase tracking-[0.15em] text-white">
                  Tracks
                </h2>
              )}
              <AudioTrackList tracks={audioTracks} likedIds={liked} onToggleLike={toggleLike} />
            </section>
          )}

          {showVideo && (
            <section>
              {filter === "all" && (
                <h2 className="mb-4 px-1 text-sm font-medium uppercase tracking-[0.15em] text-white">
                  Videos
                </h2>
              )}
              <VideoGrid videos={videos} likedIds={liked} onToggleLike={toggleLike} />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
