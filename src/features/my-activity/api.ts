import { supabase } from "@/shared/lib/supabase";
import type { Makgeolli } from "@/shared/types";

export type MyActivityItem = {
  makgeolli: Makgeolli;
  /** 가장 최근 활동 시각(reaction.updated_at 또는 comment.updated_at 중 큰 값). */
  lastActivityAt: string;
};

type MakgeolliIdRow = { makgeolli_id: string; updated_at: string };

// iOS MyMakgeolliAggregator 의 Web 단순화 — Supabase 직접 조회.
// reaction(like+dislike) + comment 의 union 으로 makgeolli_id 모은 후
// makgeolli 테이블 단일 in 쿼리로 조인. 정렬은 lastActivityAt desc.
export async function fetchMyAllActivity(
  userId: string,
): Promise<MyActivityItem[]> {
  const [reactionsRes, commentsRes] = await Promise.all([
    supabase
      .from("makgeolli_reactions")
      .select("makgeolli_id, updated_at")
      .eq("user_id", userId),
    supabase
      .from("user_comments")
      .select("makgeolli_id, updated_at")
      .eq("user_id", userId),
  ]);

  if (reactionsRes.error) throw reactionsRes.error;
  if (commentsRes.error) throw commentsRes.error;

  const reactions = (reactionsRes.data ?? []) as MakgeolliIdRow[];
  const comments = (commentsRes.data ?? []) as MakgeolliIdRow[];

  // makgeolli_id → 가장 최근 updated_at
  const latestByMakgeolliId = new Map<string, string>();
  for (const row of [...reactions, ...comments]) {
    const prev = latestByMakgeolliId.get(row.makgeolli_id);
    if (prev == null || row.updated_at > prev) {
      latestByMakgeolliId.set(row.makgeolli_id, row.updated_at);
    }
  }

  if (latestByMakgeolliId.size === 0) return [];

  const ids = Array.from(latestByMakgeolliId.keys());
  const { data: makgeollis, error } = await supabase
    .from("makgeolli")
    .select("*")
    .in("id", ids);

  if (error) throw error;

  const byId = new Map(
    ((makgeollis ?? []) as Makgeolli[]).map((m) => [m.id, m]),
  );

  const items: MyActivityItem[] = [];
  for (const [makgeolliId, lastActivityAt] of latestByMakgeolliId) {
    const makgeolli = byId.get(makgeolliId);
    if (makgeolli) items.push({ makgeolli, lastActivityAt });
  }

  items.sort((a, b) => (a.lastActivityAt < b.lastActivityAt ? 1 : -1));
  return items;
}
