import { supabase } from "@/shared/lib/supabase";
import type { UserComment } from "@/shared/types";

// iOS getPublicComments(SupabaseClientLive+Comment.swift:78) 미러 —
// makgeolli_id + is_public=true + created_at desc.
export async function fetchDetailComments(
  makgeolliId: string,
): Promise<UserComment[]> {
  const { data, error } = await supabase
    .from("user_comments")
    .select("*")
    .eq("makgeolli_id", makgeolliId)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as UserComment[];
}
