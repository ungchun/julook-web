import { supabase } from "@/shared/lib/supabase";
import type { UserComment } from "@/shared/types/user-comment";

// iOS SupabaseClientLive+Comment.swift 미러.
// 모든 user_comments 외부 IO 단일 경로. (user_id, makgeolli_id) UNIQUE 가정.

// iOS getUserComment(userId, makgeolliId) — 단일 (user_id, makgeolli_id) 쌍 1건 또는 null.
export async function fetchMyComment(
  userId: string,
  makgeolliId: string,
): Promise<UserComment | null> {
  const { data, error } = await supabase
    .from("user_comments")
    .select("*")
    .eq("user_id", userId)
    .eq("makgeolli_id", makgeolliId)
    .maybeSingle();

  if (error) throw error;
  return (data as UserComment | null) ?? null;
}

// iOS saveUserComment 미러. upsert with onConflict "user_id,makgeolli_id" —
// 작성/수정 단일 경로. updated_at 은 클라이언트가 ISO 문자열로 명시 (iOS 동일).
export async function upsertMyComment(input: {
  userId: string;
  makgeolliId: string;
  comment: string;
  isPublic: boolean;
}): Promise<void> {
  const payload = {
    user_id: input.userId,
    makgeolli_id: input.makgeolliId,
    comment: input.comment,
    is_public: input.isPublic,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from("user_comments")
    .upsert(payload, { onConflict: "user_id,makgeolli_id" });
  if (error) throw error;
}

// iOS deleteUserComment(userId, makgeolliId) 미러. commentId 사용 안 함.
export async function deleteMyComment(
  userId: string,
  makgeolliId: string,
): Promise<void> {
  const { error } = await supabase
    .from("user_comments")
    .delete()
    .eq("user_id", userId)
    .eq("makgeolli_id", makgeolliId);
  if (error) throw error;
}
