import { createServerSupabase, getAuthenticatedUser } from "@/lib/supabase/server";

type AdminAuthResult =
  | { ok: true; userId: string }
  | { ok: false; status: 401 | 403 };

export async function requireAdmin(): Promise<AdminAuthResult> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { ok: false, status: 401 };
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("admin_users")
    .select("profile_id")
    .eq("profile_id", user.id)
    .single();

  if (error || !data) {
    return { ok: false, status: 403 };
  }

  return { ok: true, userId: user.id };
}
