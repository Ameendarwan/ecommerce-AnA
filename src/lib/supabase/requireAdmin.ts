import { createServerSupabase } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import type { ProfileType } from "@/types";

export type AdminAuthResult =
  | { ok: true; userId: string; user: User; profile: ProfileType }
  | { ok: false; status: 401 | 403; error: string };

/**
 * Strictly verifies that the current server request is authenticated
 * and that the caller possesses the 'admin' role in Supabase.
 */
export async function requireAdmin(): Promise<AdminAuthResult> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, status: 401, error: "Unauthorized: Authentication required." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("profile_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (profileError || !profile || profile.role !== "admin") {
    return {
      ok: false,
      status: 403,
      error: "Forbidden: Admin privileges required.",
    };
  }

  return { ok: true, userId: user.id, user, profile: profile as ProfileType };
}
