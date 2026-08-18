"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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

  const selectTab = (value: Tab) => {
    setTab(value);
    setLastSubTab(value);
    const url = `/exclusive?tab=unreleased&media=${value}`;
    window.history.replaceState(null, "", url);
  };

  const items = useMemo(() => {
    const typeMap: Record<Tab, UnreleasedMediaSummary["media_type"]> = {
      videos: "video",
      music: "audio",
      images: "image",
    };
    return media.filter((m) => m.media_type === typeMap[tab]);
  }, [media, tab]);

  return (
    <div className="w-full max-w-[900px] pb-28">
      {/* VIDEOS / MUSIC / IMAGES */}
      <div className="mb-10 flex w-full justify-between gap-6 px-6 text-xs sm:justify-center sm:gap-10 sm:px-0 md:gap-14 lg:gap-20">
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
            className={`font-sans uppercase transition ${
              tab === value ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="py-12 text-center text-sm uppercase tracking-tight text-white/50">
          Nothing here yet.
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
