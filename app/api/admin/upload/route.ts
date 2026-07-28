import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

// Uploads go through this plain Route Handler rather than a Server Action.
// Server Actions parse multipart bodies with Next's own busboy-based
// parser (tied to the React Server Actions RSC protocol), which has shown
// to intermittently throw "Unexpected end of form" on binary uploads in
// Turbopack dev. Route Handlers use the standard Web Request/FormData
// implementation instead — a completely different, more battle-tested
// code path — so admin uploads go here and forms only ever send small
// text fields through their Server Actions.
const ALLOWED_BUCKETS = new Set([
  "unreleased-media",
  "unreleased-covers",
  "digital-downloads",
  "product-images",
]);

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const bucket = String(formData.get("bucket") ?? "");
  const file = formData.get("file");

  if (!ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const path = `${randomUUID()}-${file.name}`;
  const serviceClient = await createServiceClient();

  const { error } = await serviceClient.storage.from(bucket).upload(path, file, {
    contentType: file.type || undefined,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = serviceClient.storage.from(bucket).getPublicUrl(path);

  return NextResponse.json({ path, publicUrl: data.publicUrl });
}
