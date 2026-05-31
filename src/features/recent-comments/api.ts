import { supabase } from "@/shared/lib/supabase";
import type { Makgeolli, UserComment } from "@/shared/types";

const RECENT_COMMENTS_LIMIT = 4;

export type RecentCommentItem = {
  comment: UserComment;
  makgeolli: Makgeolli;
};

// 공통 헬퍼 — is_public=true + created_at desc 공개 코멘트를 fetch 한 뒤
// makgeolli_id 로 두 번째 쿼리하여 join 한다. limit 미지정 시 supabase 기본값.
// FK join 대신 두 번 쿼리 (Supabase metadata FK 인식 의존 회피).
async function fetchPublicCommentsJoined(
  limit?: number,
): Promise<RecentCommentItem[]> {
  const base = supabase
    .from("user_comments")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false });
  const query = limit != null ? base.limit(limit) : base;

  const { data: comments, error: commentsError } = await query;
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

// iOS getRecentComments 미러 — is_public=true + created_at desc + limit 4.
export function fetchRecentComments(): Promise<RecentCommentItem[]> {
  return fetchPublicCommentsJoined(RECENT_COMMENTS_LIMIT);
}

// iOS getRecentCommentsPaginated 의 limit/offset 없는 단순화 버전 —
// 1단계 원칙(페이지네이션 보류). Web /comments/all 페이지 deep-link 호환용 유지.
export function fetchAllPublicComments(): Promise<RecentCommentItem[]> {
  return fetchPublicCommentsJoined();
}

// iOS getRecentCommentsPaginated 미러 — .range(offset, offset+pageSize-1) 서버 페이지네이션.
// 본앱 pageSize 10. 마지막 페이지면 length < pageSize.
export async function fetchPublicCommentsPage(
  pageSize: number,
  offset: number,
): Promise<RecentCommentItem[]> {
  const { data: comments, error: commentsError } = await supabase
    .from("user_comments")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

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
