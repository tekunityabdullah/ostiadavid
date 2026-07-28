"use client";

import { Disc3, Pause, Play } from "lucide-react";
import type { UnreleasedAlbum, UnreleasedMediaSummary } from "@/lib/types";
import { useUnreleasedPlayer } from "./PlayerProvider";
import { useLikedMedia } from "./useLikedMedia";
import AudioTrackList from "./AudioTrackList";
import { ARTIST_NAME } from "./constants";

interface AlbumDetailProps {
  album: UnreleasedAlbum;
  tracks: UnreleasedMediaSummary[];
}

export default function AlbumDetail({ album, tracks }: AlbumDetailProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useUnreleasedPlayer();
  const { liked, toggleLike } = useLikedMedia();

  const isAlbumPlaying =
    isPlaying && currentTrack && tracks.some((t) => t.id === currentTrack.id);

  const handlePlayAlbum = () => {
    if (!tracks.length) return;
    if (currentTrack && tracks.some((t) => t.id === currentTrack.id)) {
      togglePlay();
    } else {
      playTrack(tracks[0]);
    }
  };

  return (
    <div className="w-full max-w-[900px]">
      <div className="mb-12 flex flex-col items-center gap-5 text-center sm:flex-row sm:items-end sm:text-left">
        <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden bg-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:h-52 sm:w-52">
          {album.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={album.cover_image} alt={album.title} className="h-full w-full object-cover" />
          ) : (
            <Disc3 size={40} className="text-white/30" />
          )}
        </div>

        <div className="min-w-0">
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">Album</span>
          <h1 className="mt-2 text-2xl font-medium uppercase tracking-wide text-white sm:text-4xl">
            {album.title}
          </h1>
          <p className="mt-2 text-sm text-white/60">{ARTIST_NAME}</p>
          {album.description && (
            <p className="mt-3 max-w-md text-xs leading-relaxed text-white/50">
              {album.description}
            </p>
          )}
          <p className="mt-3 text-xs text-white/40">
            {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
          </p>

          {tracks.length > 0 && (
            <button
              onClick={handlePlayAlbum}
              aria-label={isAlbumPlaying ? "Pause" : "Play album"}
              className="mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-[0_8px_30px_rgba(255,255,255,0.15)] transition hover:scale-105 active:scale-95 sm:mx-0 mx-auto"
            >
              {isAlbumPlaying ? (
                <Pause size={18} fill="black" />
              ) : (
                <Play size={18} fill="black" className="ml-0.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {tracks.length === 0 ? (
        <p className="py-12 text-center text-sm uppercase tracking-tight text-white/50">
          No tracks in this album yet.
        </p>
      ) : (
        <AudioTrackList tracks={tracks} likedIds={liked} onToggleLike={toggleLike} />
      )}
    </div>
  );
}
