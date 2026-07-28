import { NextRequest, NextResponse } from "next/server";
import { getStreamUrl } from "@/lib/unreleased";

// Unreleased is a fully public section — no login or exclusive membership
// required. Streaming still goes through short-lived signed URLs rather
// than a stable public file URL, so links can't be trivially shared/cached.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";

  if (!id) {
    return NextResponse.json({ error: "Missing media id" }, { status: 400 });
  }

  const stream = await getStreamUrl(id);

  if (!stream) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(stream);
}
