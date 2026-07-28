export function formatTime(seconds: number | null | undefined) {
  if (!Number.isFinite(seconds) || (seconds as number) < 0) return "--:--";
  const total = Math.floor(seconds as number);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// YouTube/Spotify-style abbreviated counts: 950, 1.2K, 3.4M.
export function formatCount(count: number) {
  if (count < 1000) return `${count}`;
  if (count < 1_000_000) return `${(count / 1000).toFixed(count < 10_000 ? 1 : 0)}K`;
  return `${(count / 1_000_000).toFixed(1)}M`;
}
