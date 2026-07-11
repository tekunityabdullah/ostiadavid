"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProfileActions() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
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
