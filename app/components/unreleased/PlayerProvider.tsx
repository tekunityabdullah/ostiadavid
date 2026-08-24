"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { UnreleasedMediaSummary } from "@/lib/types";
import { recordRecentlyPlayed } from "./recentlyPlayed";
import { ARTIST_NAME } from "./constants";

const FALLBACK_ARTWORK = "/audio-placeholder.png";

export type RepeatMode = "off" | "all" | "one";

async function fetchStreamUrl(id: string): Promise<string> {
  const res = await fetch("/api/unreleased/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Failed to load stream");
  const data = await res.json();
  return data.url as string;
}

interface PlayerContextValue {
  queue: UnreleasedMediaSummary[];
  currentTrack: UnreleasedMediaSummary | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  playTrack: (track: UnreleasedMediaSummary) => void;
  togglePlay: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  changeVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  playNext: () => void;
  playPrevious: () => void;
  stop: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function useUnreleasedPlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("useUnreleasedPlayer must be used within PlayerProvider");
  }
  return ctx;
}

interface PlayerProviderProps {
  children: React.ReactNode;
  audioTracks: UnreleasedMediaSummary[];
}

export default function PlayerProvider({ children, audioTracks }: PlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tracksRef = useRef(audioTracks);
  tracksRef.current = audioTracks;

  const [currentTrack, setCurrentTrack] = useState<UnreleasedMediaSummary | null>(null);
  const currentTrackRef = useRef<UnreleasedMediaSummary | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const shuffleRef = useRef(shuffle);
  shuffleRef.current = shuffle;
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const repeatModeRef = useRef(repeatMode);
  repeatModeRef.current = repeatMode;
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  const loadAndPlay = useCallback(async (track: UnreleasedMediaSummary) => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsLoading(true);
    setCurrentTrack(track);
    currentTrackRef.current = track;
    recordRecentlyPlayed(track.id);
    try {
      const url = await fetchStreamUrl(track.id);
      audio.src = url;
      audio.currentTime = 0;
      await audio.play();
    } catch (err) {
      console.error("Failed to play track:", err);
      setIsLoading(false);
    }
  }, []);

  // Shared by manual skip buttons and natural track-end auto-advance.
  // Manual skips always move and wrap; auto-advance on "ended" respects
  // shuffle/repeat like a real player (repeat-one replays, repeat-off stops
  // at the end of the list instead of looping).
  const advance = useCallback(
    (direction: 1 | -1, opts: { auto: boolean }) => {
      const list = tracksRef.current;
      if (!list.length) return;

      if (opts.auto && repeatModeRef.current === "one") {
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = 0;
          audio.play();
        }
        return;
      }

      const current = currentTrackRef.current;
      const idx = current ? list.findIndex((t) => t.id === current.id) : -1;

      if (shuffleRef.current && list.length > 1) {
        let nextIdx = idx;
        while (nextIdx === idx) nextIdx = Math.floor(Math.random() * list.length);
        loadAndPlay(list[nextIdx]);
        return;
      }

      let nextIdx = idx + direction;
      if (nextIdx >= list.length) {
        if (opts.auto && repeatModeRef.current !== "all") {
          audioRef.current?.pause();
          return;
        }
        nextIdx = 0;
      } else if (nextIdx < 0) {
        nextIdx = list.length - 1;
      }
      loadAndPlay(list[nextIdx]);
    },
    [loadAndPlay]
  );

  const playNext = useCallback(() => advance(1, { auto: false }), [advance]);
  const playPrevious = useCallback(() => advance(-1, { auto: false }), [advance]);
  const handleEnded = useCallback(() => advance(1, { auto: true }), [advance]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    // Keeps the browser/OS from offering AirPlay/Cast routing for this
    // element — we don't support remote playback and don't want that
    // option showing up in the OS-level "Now Playing" widget.
    audio.disableRemotePlayback = true;
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onPlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, [handleEnded]);

  const playTrack = useCallback(
    (track: UnreleasedMediaSummary) => {
      const audio = audioRef.current;
      if (currentTrackRef.current?.id === track.id && audio) {
        if (audio.paused) audio.play();
        else audio.pause();
        return;
      }
      loadAndPlay(track);
    },
    [loadAndPlay]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrackRef.current) return;
    if (audio.paused) audio.play();
    else audio.pause();
  }, []);

  // Always pauses (never toggles into playing) — used by a playing video
  // to claim playback exclusivity, so audio and video never sound at once.
  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const changeVolume = useCallback((v: number) => {
    const audio = audioRef.current;
    setVolumeState(v);
    setMuted(v === 0);
    if (audio) {
      audio.volume = v;
      audio.muted = v === 0;
    }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    setMuted((prev) => {
      const next = !prev;
      if (audio) audio.muted = next;
      return next;
    });
  }, []);

  // Fully dismisses the player — used by the close button on the bar,
  // distinct from pause (which keeps the bar/track around to resume).
  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    setCurrentTrack(null);
    currentTrackRef.current = null;
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const toggleShuffle = useCallback(() => setShuffle((prev) => !prev), []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((prev) =>
      prev === "off" ? "all" : prev === "all" ? "one" : "off"
    );
  }, []);

  // Populates the OS/browser-level "Now Playing" widget (lock screen,
  // notification center, Windows volume flyout, etc.) the same way
  // Spotify/YouTube do — real title, artist and artwork instead of
  // whatever generic fallback the browser would otherwise show.
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    if (!currentTrack) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
      return;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: ARTIST_NAME,
      artwork: [
        { src: currentTrack.cover_image || FALLBACK_ARTWORK, sizes: "512x512", type: "image/png" },
      ],
    });
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => audioRef.current?.play());
    navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause());
    navigator.mediaSession.setActionHandler("previoustrack", playPrevious);
    navigator.mediaSession.setActionHandler("nexttrack", playNext);
    navigator.mediaSession.setActionHandler("stop", stop);
    // Explicitly opting out (rather than leaving unset) is what stops
    // Chrome from falling back to its default 10-second skip buttons —
    // we don't support seeking from the OS widget, like Spotify/YouTube.
    navigator.mediaSession.setActionHandler("seekbackward", null);
    navigator.mediaSession.setActionHandler("seekforward", null);

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("stop", null);
    };
  }, [playNext, playPrevious, stop]);

  // Spotify/YouTube-style transport shortcuts. Skipped while typing in a
  // form field so they don't hijack normal text entry elsewhere on the site.
  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const audio = audioRef.current;
      if (!audio || !currentTrackRef.current) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (audio.paused) audio.play();
          else audio.pause();
          break;
        case "ArrowRight":
          e.preventDefault();
          audio.currentTime = Math.min(audio.duration || audio.currentTime, audio.currentTime + 5);
          break;
        case "ArrowLeft":
          e.preventDefault();
          audio.currentTime = Math.max(0, audio.currentTime - 5);
          break;
        case "ArrowUp":
          e.preventDefault();
          changeVolume(Math.min(1, Math.round((volumeRef.current + 0.05) * 100) / 100));
          break;
        case "ArrowDown":
          e.preventDefault();
          changeVolume(Math.max(0, Math.round((volumeRef.current - 0.05) * 100) / 100));
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [changeVolume]);

  return (
    <PlayerContext.Provider
      value={{
        queue: audioTracks,
        currentTrack,
        isPlaying,
        isLoading,
        currentTime,
        duration,
        volume,
        muted,
        shuffle,
        repeatMode,
        playTrack,
        togglePlay,
        pause,
        seekTo,
        changeVolume,
        toggleMute,
        toggleShuffle,
        cycleRepeat,
        playNext,
        playPrevious,
        stop,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
