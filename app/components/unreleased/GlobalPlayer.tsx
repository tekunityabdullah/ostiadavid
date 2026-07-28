"use client";

import { useEffect, useState } from "react";
import type { UnreleasedMediaSummary } from "@/lib/types";
import PlayerProvider from "./PlayerProvider";
import AudioPlayerBar from "./AudioPlayerBar";

// Mounted once in the root layout so playback survives client-side
// navigation to any other page on the site, Spotify/YouTube-web-player
// style. Fetches the audio queue itself (client-side) rather than the
// layout fetching it server-side, which would force every page — even
// static ones — into dynamic rendering just to seed this queue.
export default function GlobalPlayer({ children }: { children: React.ReactNode }) {
  const [audioTracks, setAudioTracks] = useState<UnreleasedMediaSummary[]>([]);

  useEffect(() => {
    fetch("/api/unreleased/list")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: UnreleasedMediaSummary[]) => {
        if (Array.isArray(data)) {
          setAudioTracks(data.filter((m) => m.media_type === "audio"));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <PlayerProvider audioTracks={audioTracks}>
      {children}
      <AudioPlayerBar />
    </PlayerProvider>
  );
}
