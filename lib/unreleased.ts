import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { UnreleasedAlbum, UnreleasedMediaSummary } from "@/lib/types";

// Public metadata columns only — file_path is never selected here, so the
// storage path can't leak to a client component even by accident. Playback
// always goes through /api/unreleased/stream, which resolves it server-side.
const SUMMARY_COLUMNS =
  "id, title, media_type, description, cover_image, youtube_url, duration_seconds, play_count, album_id, track_number, created_at, sort_order, price";

const UNRELEASED_BUCKET = "unreleased-media";
const SIGNED_URL_EXPIRY_SECONDS = 60 * 15; // 15 minutes — reissued per play

export interface StreamInfo {
  url: string;
  mediaType: string;
  title: string;
  expiresIn: number;
}

// Shared by /api/unreleased/stream (client-triggered plays) and the video
// detail page (which resolves this server-side at render time so the
// browser can start fetching the video immediately instead of waiting on
// a client round-trip after mount).
export async function getStreamUrl(id: string): Promise<StreamInfo | null> {
  const supabase = await createClient();
  const { data: media, error } = await supabase
    .from("unreleased_media")
    .select("file_path, youtube_url, media_type, title")
    .eq("id", id)
    .single();

  if (error || !media) return null;

  const { error: countError } = await supabase.rpc("increment_unreleased_play_count", {
    media_id: id,
  });
  if (countError) console.error("Failed to increment play count:", countError.message);

  // YouTube-linked videos have no file in our storage — the link itself is
  // already public, so it's returned as-is instead of being signed.
  if (media.youtube_url) {
    return {
      url: media.youtube_url,
      mediaType: media.media_type,
      title: media.title,
      expiresIn: 0,
    };
  }

  if (!media.file_path) return null;

  const serviceClient = await createServiceClient();
  const { data: signed, error: signError } = await serviceClient.storage
    .from(UNRELEASED_BUCKET)
    .createSignedUrl(media.file_path, SIGNED_URL_EXPIRY_SECONDS);

  if (signError || !signed?.signedUrl) {
    console.error("Failed to create signed streaming URL:", signError);
    return null;
  }

  return {
    url: signed.signedUrl,
    mediaType: media.media_type,
    title: media.title,
    expiresIn: SIGNED_URL_EXPIRY_SECONDS,
  };
}

export async function getUnreleasedMedia(): Promise<UnreleasedMediaSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("unreleased_media")
    .select(SUMMARY_COLUMNS)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch unreleased media:", error.message);
    return [];
  }

  return (data ?? []) as UnreleasedMediaSummary[];
}

export async function getUnreleasedMediaById(
  id: string
): Promise<UnreleasedMediaSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("unreleased_media")
    .select(SUMMARY_COLUMNS)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as UnreleasedMediaSummary;
}

export async function getAlbums(): Promise<UnreleasedAlbum[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("unreleased_albums")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch albums:", error.message);
    return [];
  }

  return (data ?? []) as UnreleasedAlbum[];
}

export async function getAlbumById(id: string): Promise<UnreleasedAlbum | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("unreleased_albums")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as UnreleasedAlbum;
}

export async function getAlbumTracks(albumId: string): Promise<UnreleasedMediaSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("unreleased_media")
    .select(SUMMARY_COLUMNS)
    .eq("album_id", albumId)
    .eq("media_type", "audio")
    .order("track_number", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch album tracks:", error.message);
    return [];
  }

  return (data ?? []) as UnreleasedMediaSummary[];
}
