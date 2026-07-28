"use client";

import { useCallback, useEffect, useState } from "react";

const LIKED_KEY = "unreleased-liked-ids";

function readLiked(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LIKED_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function useLikedMedia() {
  const [liked, setLiked] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLiked(readLiked());
  }, []);

  const toggleLike = useCallback((id: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(LIKED_KEY, JSON.stringify([...next]));
      } catch {
        // localStorage unavailable — like state just won't persist.
      }
      return next;
    });
  }, []);

  return { liked, toggleLike };
}
