"use client";

import { useCallback, useEffect, useState } from "react";

const PLAYLISTS_KEY = "unreleased-playlists";

export interface Playlist {
  id: string;
  name: string;
  mediaIds: string[];
  createdAt: string;
}

function readPlaylists(): Playlist[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PLAYLISTS_KEY);
    return raw ? (JSON.parse(raw) as Playlist[]) : [];
  } catch {
    return [];
  }
}

function writePlaylists(playlists: Playlist[]) {
  try {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  } catch {
    // localStorage unavailable — playlists just won't persist.
  }
}

// Mirrors useLikedMedia's pattern: no accounts exist for this public
// section, so playlists (like Liked/Recently Played) live in the browser.
export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    setPlaylists(readPlaylists());
  }, []);

  const createPlaylist = useCallback((name: string): Playlist => {
    const playlist: Playlist = {
      id: crypto.randomUUID(),
      name,
      mediaIds: [],
      createdAt: new Date().toISOString(),
    };
    setPlaylists((prev) => {
      const next = [playlist, ...prev];
      writePlaylists(next);
      return next;
    });
    return playlist;
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    setPlaylists((prev) => {
      const next = prev.filter((p) => p.id !== playlistId);
      writePlaylists(next);
      return next;
    });
  }, []);

  const addToPlaylist = useCallback((playlistId: string, mediaId: string) => {
    setPlaylists((prev) => {
      const next = prev.map((p) =>
        p.id === playlistId && !p.mediaIds.includes(mediaId)
          ? { ...p, mediaIds: [...p.mediaIds, mediaId] }
          : p
      );
      writePlaylists(next);
      return next;
    });
  }, []);

  const removeFromPlaylist = useCallback((playlistId: string, mediaId: string) => {
    setPlaylists((prev) => {
      const next = prev.map((p) =>
        p.id === playlistId
          ? { ...p, mediaIds: p.mediaIds.filter((id) => id !== mediaId) }
          : p
      );
      writePlaylists(next);
      return next;
    });
  }, []);

  return { playlists, createPlaylist, deletePlaylist, addToPlaylist, removeFromPlaylist };
}
