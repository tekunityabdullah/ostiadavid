"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { UnreleasedMediaSummary } from "@/lib/types";
import MusicGrid from "./MusicGrid";
import VideoGrid from "./VideoGrid";
import ImageGrid from "./ImageGrid";
import { getLastSubTab, setLastSubTab } from "./lastTab";

type Tab = "videos" | "music" | "images";

const VALID_TABS: Tab[] = ["videos", "music", "images"];

function resolveInitialTab(requested: string | null): Tab {
  if (VALID_TABS.includes(requested as Tab)) return requested as Tab;
  const remembered = getLastSubTab();
  if (VALID_TABS.includes(remembered as Tab)) return remembered as Tab;
  return "music";
}

export default function MediaLibrary({ media }: { media: UnreleasedMediaSummary[] }) {
  // The URL's ?media= wins when present (e.g. a link that explicitly deep
  // links a sub-tab); otherwise fall back to whatever sub-tab was last
  // active this session, so returning from a track/video/image detail page
  // lands back on the same Videos/Music/Images tab instead of resetting.
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(() => resolveInitialTab(searchParams.get("media")));
  const [query, setQuery] = useState("");

  const selectTab = (value: Tab) => {
    setTab(value);
    setLastSubTab(value);
    const url = `/exclusive?tab=unreleased&media=${value}`;
    window.history.replaceState(null, "", url);
  };

  const normalizedQuery = query.trim().toLowerCase();

  const items = useMemo(() => {
    const typeMap: Record<Tab, UnreleasedMediaSummary["media_type"]> = {
      videos: "video",
      music: "audio",
      images: "image",
    };
    return media.filter((m) => {
      if (m.media_type !== typeMap[tab]) return false;
      if (normalizedQuery && !m.title.toLowerCase().includes(normalizedQuery)) return false;
      return true;
    });
  }, [media, tab, normalizedQuery]);

  return (
    <div className="w-full max-w-[900px] pb-28">
      {/* VIDEOS / MUSIC / IMAGES */}
      <div className="mb-10 flex justify-center gap-8 text-xs sm:gap-14">
        {(
          [
            ["videos", "Videos"],
            ["music", "Music"],
            ["images", "Images"],
          ] as [Tab, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => selectTab(value)}
            className={`uppercase tracking-[0.2em] transition ${
              tab === value ? "font-semibold text-white" : "font-normal text-white/40 hover:text-white/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mx-auto mb-10 flex max-w-lg items-center gap-2 border border-white/15 px-3 py-2 focus-within:border-white/40">
        <Search size={14} className="shrink-0 text-white/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search unreleased..."
          className="w-full bg-transparent text-xs uppercase tracking-tight text-white outline-none placeholder:text-white/30"
        />
      </div>

      {items.length === 0 ? (
        <p className="py-12 text-center text-sm uppercase tracking-tight text-white/50">
          {normalizedQuery ? "No matches for that search." : "Nothing here yet."}
        </p>
      ) : tab === "videos" ? (
        <VideoGrid videos={items} hideActions />
      ) : tab === "music" ? (
        <MusicGrid tracks={items} hideActions />
      ) : (
        <ImageGrid images={items} hideActions />
      )}
    </div>
  );
}
