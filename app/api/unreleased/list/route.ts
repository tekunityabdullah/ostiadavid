import { NextResponse } from "next/server";
import { getUnreleasedMedia } from "@/lib/unreleased";
import { getAccountType, isAdmin } from "@/lib/auth";

// Unreleased lives behind the Exclusive page — this stays a plain GET
// (rather than gated in proxy.ts) so the global player queue can be
// fetched client-side without forcing every page in the app into dynamic
// rendering. RLS on unreleased_media already restricts rows to exclusive
// members/admins, so a non-member simply gets an empty queue back.
export async function GET() {
  const accountType = await getAccountType();
  if (accountType !== "exclusive" && !(await isAdmin())) {
    return NextResponse.json([]);
  }

  const media = await getUnreleasedMedia();
  return NextResponse.json(media);
}
