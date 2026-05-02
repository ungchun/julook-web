import { supabase } from "@/shared/lib/supabase";
import type { Makgeolli, UserComment } from "@/shared/types";

const RECENT_COMMENTS_LIMIT = 4;

export type RecentCommentItem = {
  comment: UserComment;
  makgeolli: Makgeolli;
};

// iOS getRecentComments 미러 — is_public=true + created_at desc + limit 4.
// Supabase FK join으로 makgeolli row까지 한 번에 받는다 (iOS는 N+1로 따로 fetch).
export async function fetchRecentComments(): Promise<RecentCommentItem[]> {
  const { data, error } = await supabase
    .from("user_comments")
    .select("*, makgeolli:makgeolli_id(*)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(RECENT_COMMENTS_LIMIT);

  if (error) throw error;
  if (!data) return [];

  return data
    .map((row) => {
      const { makgeolli, ...comment } = row as UserComment & {
        makgeolli: Makgeolli | null;
      };
      if (!makgeolli) return null;
      return { comment: comment as UserComment, makgeolli };
    })
    .filter((item): item is RecentCommentItem => item !== null);
}
