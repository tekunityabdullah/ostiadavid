import { createClient } from "@/lib/supabase/server";
import type { EventItem } from "@/lib/types";

// RLS restricts rows to exclusive members/admins — same gate as the
// Unreleased tab, since both live inside the Exclusive page.
export async function getEvents(): Promise<EventItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) {
    console.error("Failed to fetch events:", error.message);
    return [];
  }

  return (data ?? []) as EventItem[];
}
