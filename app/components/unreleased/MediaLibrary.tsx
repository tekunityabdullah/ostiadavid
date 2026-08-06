"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Disc3, Heart, ListMusic, Search } from "lucide-react";
import type { UnreleasedMediaSummary } from "@/lib/types";
import MusicGrid from "./MusicGrid";
import VideoGrid from "./VideoGrid";
import ImageGrid from "./ImageGrid";
import { useLikedMedia } from "./useLikedMedia";

type Tab = "videos" | "music" | "images";

export default function MediaLibrary({ media }: { media: UnreleasedMediaSummary[] }) {
  const [tab, setTab] = useState<Tab>("music");
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const [query, setQuery] = useState("");
  const { liked, toggleLike } = useLikedMedia();

  const normalizedQuery = query.trim().toLowerCase();

  const items = useMemo(() => {
    const typeMap: Record<Tab, UnreleasedMediaSummary["media_type"]> = {
      videos: "video",
      music: "audio",
      images: "image",
    };
    return media.filter((m) => {
      if (m.media_type !== typeMap[tab]) return false;
      if (showLikedOnly && !liked.has(m.id)) return false;
      if (normalizedQuery && !m.title.toLowerCase().includes(normalizedQuery)) return false;
      return true;
    });
  }, [media, tab, showLikedOnly, liked, normalizedQuery]);

  return (
    <div className="w-full max-w-[900px] pb-28">
      {/* VIDEOS / MUSIC / IMAGES */}
      <div className="mb-10 flex justify-center gap-10 text-xs sm:gap-16">
        {(
          [
            ["videos", "Videos"],
            ["music", "Music"],
            ["images", "Images"],
          ] as [Tab, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`uppercase tracking-[0.15em] transition ${
              tab === value ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

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

      <div className="mx-auto mb-10 flex max-w-lg items-center justify-center gap-2">
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
        <button
          onClick={() => setShowLikedOnly((prev) => !prev)}
          aria-pressed={showLikedOnly}
          className={`flex flex-1 items-center justify-center gap-2 border px-3 py-2 text-xs uppercase tracking-tight transition ${
            showLikedOnly
              ? "border-white bg-white text-black"
              : "border-white/15 text-white/60 hover:border-white/40 hover:text-white"
          }`}
        >
          <Heart size={14} fill={showLikedOnly ? "black" : "none"} />
          Liked
        </button>
      </div>

      {items.length === 0 ? (
        <p className="py-12 text-center text-sm uppercase tracking-tight text-white/50">
          {normalizedQuery
            ? "No matches for that search."
            : showLikedOnly
              ? "Nothing liked yet — tap the heart on an item."
              : "Nothing here yet."}
        </p>
      ) : tab === "videos" ? (
        <VideoGrid videos={items} likedIds={liked} onToggleLike={toggleLike} />
      ) : tab === "music" ? (
        <MusicGrid tracks={items} likedIds={liked} onToggleLike={toggleLike} />
      ) : (
        <ImageGrid images={items} likedIds={liked} onToggleLike={toggleLike} />
      )}
    </div>
  );
}
