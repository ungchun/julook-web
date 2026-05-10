import { supabase } from "@/shared/lib/supabase";
import type { Makgeolli, ReactionType, UserComment } from "@/shared/types";

export type MyActivityItem = {
  makgeolli: Makgeolli;
  /** 가장 최근 활동 시각(reaction.updated_at 또는 comment.updated_at 중 큰 값). */
  lastActivityAt: string;
};

export type MyReactionItem = {
  makgeolli: Makgeolli;
  reactedAt: string;
};

export type MyCommentItem = {
  comment: UserComment;
  makgeolli: Makgeolli;
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

// iOS reactionClient.getAllReactions + 클라이언트 type 필터의 Web 단순화 —
// supabase 에서 user_id + reaction_type 직접 필터.
export async function fetchMyReactionMakgeollis(
  userId: string,
  reactionType: ReactionType,
): Promise<MyReactionItem[]> {
  const { data: reactions, error: reactionsError } = await supabase
    .from("makgeolli_reactions")
    .select("makgeolli_id, updated_at")
    .eq("user_id", userId)
    .eq("reaction_type", reactionType)
    .order("updated_at", { ascending: false });

  if (reactionsError) throw reactionsError;
  const rows = (reactions ?? []) as Array<{
    makgeolli_id: string;
    updated_at: string;
  }>;
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.makgeolli_id);
  const { data: makgeollis, error } = await supabase
    .from("makgeolli")
    .select("*")
    .in("id", ids);

  if (error) throw error;

  const byId = new Map(
    ((makgeollis ?? []) as Makgeolli[]).map((m) => [m.id, m]),
  );

  // reaction order(updated_at desc) 그대로 보존
  const items: MyReactionItem[] = [];
  for (const row of rows) {
    const makgeolli = byId.get(row.makgeolli_id);
    if (makgeolli) items.push({ makgeolli, reactedAt: row.updated_at });
  }
  return items;
}

// iOS getUserComments(userId) 미러 — 본인 모든 코멘트(공개/비공개 포함) + makgeolli 조인.
export async function fetchMyComments(
  userId: string,
): Promise<MyCommentItem[]> {
  const { data: comments, error: commentsError } = await supabase
    .from("user_comments")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (commentsError) throw commentsError;
  const rows = (comments ?? []) as UserComment[];
  if (rows.length === 0) return [];

  const ids = rows.map((c) => c.makgeolli_id);
  const { data: makgeollis, error } = await supabase
    .from("makgeolli")
    .select("*")
    .in("id", ids);

  if (error) throw error;

  const byId = new Map(
    ((makgeollis ?? []) as Makgeolli[]).map((m) => [m.id, m]),
  );

  const items: MyCommentItem[] = [];
  for (const comment of rows) {
    const makgeolli = byId.get(comment.makgeolli_id);
    if (makgeolli) items.push({ comment, makgeolli });
  }
  return items;
}
