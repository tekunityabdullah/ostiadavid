"use client";

import { createClient } from "@/lib/supabase/client";

export default function ProfileActions() {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Hard navigation — avoids the client router cache serving a page
    // rendered for the account that just signed out.
    window.location.href = "/login";
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-full px-6 py-2 text-xs uppercase tracking-tight font-medium text-white border border-white/30 cursor-pointer transition-colors hover:bg-white/10"
    >
      Sign Out
    </button>
  );
}
