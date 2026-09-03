import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";

// Service client (bypasses RLS), gated by our own isAdmin() check instead —
// this route previously used the RLS-bound client with no isAdmin() check
// at all, so an admin whose own customer profile wasn't specifically
// flagged "exclusive" would have exclusive products silently filtered out
// of their own product list by the "Exclusive users can read all products"
// policy, and the route had no real access control of its own either way.
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
