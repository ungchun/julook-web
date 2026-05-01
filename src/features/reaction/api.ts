import { supabase } from "@/shared/lib/supabase";
import type {
  MakgeolliReactionCount,
  ReactionType,
} from "@/shared/types";

// iOS Live+Reaction.swift 미러.
// 단일 사용자 + 단일 막걸리에 대한 반응 1건 (없으면 null).
export async function fetchUserReaction(
  userId: string,
  makgeolliId: string,
): Promise<ReactionType | null> {
  const { data, error } = await supabase
    .from("makgeolli_reactions")
    .select("reaction_type")
    .eq("user_id", userId)
    .eq("makgeolli_id", makgeolliId)
    .maybeSingle();

  if (error) throw error;
  return (data?.reaction_type as ReactionType | undefined) ?? null;
}

// 트리거가 자동 갱신하는 view. 없는 막걸리는 0/0으로 처리.
export async function fetchReactionCounts(
  makgeolliId: string,
): Promise<Pick<MakgeolliReactionCount, "like_count" | "dislike_count">> {
  const { data, error } = await supabase
    .from("makgeolli_reaction_counts")
    .select("like_count, dislike_count")
    .eq("makgeolli_id", makgeolliId)
    .maybeSingle();

  if (error) throw error;
  return {
    like_count: data?.like_count ?? 0,
    dislike_count: data?.dislike_count ?? 0,
  };
}

// existing 있으면 update, 없으면 insert (iOS saveReaction 미러).
// 서버 trigger가 reaction_counts를 자동 갱신.
export async function saveReaction(
  userId: string,
  makgeolliId: string,
  reactionType: ReactionType,
): Promise<void> {
  const { data: existing, error: selectError } = await supabase
    .from("makgeolli_reactions")
    .select("id")
    .eq("user_id", userId)
    .eq("makgeolli_id", makgeolliId)
    .maybeSingle();

  if (selectError) throw selectError;

  if (existing) {
    const { error } = await supabase
      .from("makgeolli_reactions")
      .update({
        reaction_type: reactionType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("makgeolli_reactions").insert({
      user_id: userId,
      makgeolli_id: makgeolliId,
      reaction_type: reactionType,
    });
    if (error) throw error;
  }
}

export async function deleteReaction(
  userId: string,
  makgeolliId: string,
): Promise<void> {
  const { error } = await supabase
    .from("makgeolli_reactions")
    .delete()
    .eq("user_id", userId)
    .eq("makgeolli_id", makgeolliId);
  if (error) throw error;
}
