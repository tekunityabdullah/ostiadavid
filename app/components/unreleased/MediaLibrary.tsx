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

// `preferRemembered` distinguishes "returning" from "landing fresh": a
// breadcrumb/back-button navigation explicitly carries ?tab=unreleased in
// the URL (see ExclusiveTabs), so it's safe to restore whatever sub-tab
// was last active. A bare /exclusive (the Exclusive nav link, defaulting
// to Unreleased on its own) carries no such signal, and should always
// land on Music regardless of session history.
function resolveInitialTab(requested: string | null, preferRemembered: boolean): Tab {
  if (VALID_TABS.includes(requested as Tab)) return requested as Tab;
  if (preferRemembered) {
    const remembered = getLastSubTab();
    if (VALID_TABS.includes(remembered as Tab)) return remembered as Tab;
  }
  return "music";
}

export default function MediaLibrary({
  media,
  preferRememberedTab = false,
}: {
  media: UnreleasedMediaSummary[];
  preferRememberedTab?: boolean;
}) {
  // The URL's ?media= wins when present (e.g. a link that explicitly deep
  // links a sub-tab); otherwise fall back to whatever sub-tab was last
  // active this session — but only when preferRememberedTab says this is a
  // "returning" navigation, not a fresh landing.
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(() =>
    resolveInitialTab(searchParams.get("media"), preferRememberedTab)
  );

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
              value === "videos" ? "translate-x-1" : value === "images" ? "-translate-x-1" : ""
            } ${tab === value ? "text-white" : "text-white/40 hover:text-white/70"}`}
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
