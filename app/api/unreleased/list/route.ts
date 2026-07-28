import { NextResponse } from "next/server";
import { getUnreleasedMedia } from "@/lib/unreleased";

// Public metadata list, fetched client-side by the global player so the
// root layout itself stays free of cookie-bound Supabase calls — pulling
// this into the layout as a server fetch would force every page in the
// app (including static ones like /login, /tour, /cart) into dynamic
// rendering just to build one page's audio queue.
export async function GET() {
  const media = await getUnreleasedMedia();
  return NextResponse.json(media);
}
