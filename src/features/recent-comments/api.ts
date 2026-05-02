import { supabase } from "@/shared/lib/supabase";
import type { Makgeolli, UserComment } from "@/shared/types";

const RECENT_COMMENTS_LIMIT = 4;

export type RecentCommentItem = {
  comment: UserComment;
  makgeolli: Makgeolli;
};

// iOS getRecentComments 미러 — is_public=true + created_at desc + limit 4.
// FK join 대신 두 번 쿼리 (Supabase metadata FK 인식 의존 회피).
export async function fetchRecentComments(): Promise<RecentCommentItem[]> {
  const { data: comments, error: commentsError } = await supabase
    .from("user_comments")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(RECENT_COMMENTS_LIMIT);

  if (commentsError) throw commentsError;
  if (!comments || comments.length === 0) return [];

  const ids = (comments as UserComment[]).map((c) => c.makgeolli_id);
  const { data: makgeollis, error: makgeolliError } = await supabase
    .from("makgeolli")
    .select("*")
    .in("id", ids);

  if (makgeolliError) throw makgeolliError;

  const byId = new Map(
    ((makgeollis ?? []) as Makgeolli[]).map((m) => [m.id, m]),
  );

  return (comments as UserComment[])
    .map((comment) => {
      const makgeolli = byId.get(comment.makgeolli_id);
      if (!makgeolli) return null;
      return { comment, makgeolli };
    })
    .filter((item): item is RecentCommentItem => item !== null);
}
