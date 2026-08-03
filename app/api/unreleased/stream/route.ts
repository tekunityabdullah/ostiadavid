import { NextRequest, NextResponse } from "next/server";
import { getStreamUrl } from "@/lib/unreleased";
import { getAccountType, isAdmin } from "@/lib/auth";

// Unreleased lives behind the Exclusive page — only exclusive members (or
// admins) can resolve a streaming URL. RLS on unreleased_media backs this
// up independently, but this check gives a clean 403 instead of a bare 404.
export async function POST(request: NextRequest) {
  const accountType = await getAccountType();
  if (accountType !== "exclusive" && !(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
