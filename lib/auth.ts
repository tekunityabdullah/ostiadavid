import { createClient } from "@/lib/supabase/server";
import type { AccountType, Profile } from "@/lib/types";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data as Profile | null;
}

export async function getAccountType(): Promise<AccountType | null> {
  const profile = await getProfile();
  return profile?.account_type ?? null;
}

// Admin status lives in its own `admins` table, separate from the
// customer-facing `profiles` table — staff/role membership is a different
// concern from customer account tiers (regular/exclusive).
export async function isAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  if (!user) return false;

  const supabase = await createClient();
  const { data } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return !!data;
}
