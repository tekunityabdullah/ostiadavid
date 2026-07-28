// Lightweight client-side play history — no account system exists for the
// (fully public) Unreleased section, so "Recently Played" and "Liked" both
// live in localStorage rather than a database table.
const RECENT_KEY = "unreleased-recently-played";
const MAX_RECENT = 8;

export function recordRecentlyPlayed(id: string) {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentlyPlayedIds().filter((existingId) => existingId !== id);
    const next = [id, ...existing].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private browsing, etc.) — history is best-effort.
  }
}

export function getRecentlyPlayedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}
