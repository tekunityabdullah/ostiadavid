import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getAccountType, isAdmin } from "@/lib/auth";

const UNRELEASED_BUCKET = "unreleased-media";
// Short-lived on purpose: this signed URL is only ever used by this route
// itself, immediately, server-to-server — it never reaches the browser.
const INTERNAL_SIGN_EXPIRY_SECONDS = 60;

// Streams audio/video through our own server instead of ever handing the
// browser a Supabase signed URL directly. A raw signed URL works for
// anyone who has it — copy it out of DevTools, paste it in curl on a
// different machine with no login at all, and it still plays until it
// expires. Routing through here means every single byte request re-checks
// "is this actually an Exclusive member" — copy this route's URL out of
// DevTools and it's useless anywhere your browser's session isn't.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const accountType = await getAccountType();
  if (accountType !== "exclusive" && !(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const supabase = await createClient();
  const { data: media, error } = await supabase
    .from("unreleased_media")
    .select("file_path, media_type")
    .eq("id", id)
    .single();

  if (error || !media?.file_path) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fire-and-forget — nothing downstream needs this to finish, and
  // awaiting it would add a network round-trip before any audio/video
  // could start.
  supabase
    .rpc("increment_unreleased_play_count", { media_id: id })
    .then(({ error: countError }) => {
      if (countError) console.error("Failed to increment play count:", countError.message);
    });

  const serviceClient = await createServiceClient();
  const { data: signed, error: signError } = await serviceClient.storage
    .from(UNRELEASED_BUCKET)
    .createSignedUrl(media.file_path, INTERNAL_SIGN_EXPIRY_SECONDS);

  if (signError || !signed?.signedUrl) {
    console.error("Failed to create internal signed URL:", signError);
    return NextResponse.json({ error: "Failed to load media" }, { status: 500 });
  }

  // Forwarding Range is what keeps seeking/scrubbing working — the
  // <video>/<audio> element requests specific byte ranges as you scrub,
  // not just the whole file once.
  const range = request.headers.get("range");
  const upstream = await fetch(signed.signedUrl, {
    headers: range ? { range } : undefined,
  });

  if (!upstream.ok && upstream.status !== 206) {
    return NextResponse.json({ error: "Failed to load media" }, { status: 502 });
  }

  const headers = new Headers();
  for (const name of ["content-type", "content-length", "content-range", "accept-ranges", "cache-control"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (!headers.has("accept-ranges")) headers.set("Accept-Ranges", "bytes");
  // Always inline, never a suggested download filename/prompt.
  headers.set("Content-Disposition", "inline");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });
}
