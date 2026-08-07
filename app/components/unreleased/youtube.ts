// Small helpers for the "paste a YouTube link instead of uploading" video
// source — extracts the video ID from the common URL shapes admins might
// paste, then derives an embeddable URL and a thumbnail from it.

export function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return u.pathname.slice(1).split("/")[0] || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const match = u.pathname.match(/\/(embed|shorts)\/([^/?]+)/);
      if (match) return match[2];
    }

    return null;
  } catch {
    return null;
  }
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` : null;
}

export function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}
