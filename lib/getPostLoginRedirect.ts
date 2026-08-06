import type { SupabaseClient } from "@supabase/supabase-js";

// After any successful sign-in — whether through /login or the sign-in
// panel on /signup — an exclusive member lands on /exclusive (where their
// media player and drops live) instead of the generic homepage. This is
// keyed off the account's account_type, not which page was used to log
// in, so the same account always lands in the same place.
export async function getPostLoginRedirect(supabase: SupabaseClient): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "/";

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .single();

  return profile?.account_type === "exclusive" ? "/exclusive" : "/";
}
