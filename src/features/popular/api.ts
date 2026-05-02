import { supabase } from "@/shared/lib/supabase";
import type { Makgeolli } from "@/shared/types";

const TOP_LIKED_LIMIT = 3;

// iOS fetchTopLikedMakgeollis 미러 — 두 단계:
// 1. makgeolli_reaction_counts에서 like_count desc top 3
// 2. 그 makgeolli_id들로 makgeolli 본 row in 쿼리
// 3. 원래 순서(랭킹) 보존
export async function fetchTopLikedMakgeollis(): Promise<Makgeolli[]> {
  const { data: counts, error: countsError } = await supabase
    .from("makgeolli_reaction_counts")
    .select("makgeolli_id, like_count, updated_at")
    .order("like_count", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(TOP_LIKED_LIMIT);

  if (countsError) throw countsError;
  if (!counts || counts.length === 0) return [];

  const ids = counts.map((c) => c.makgeolli_id as string);

  const { data: makgeollis, error: makgeolliError } = await supabase
    .from("makgeolli")
    .select("*")
    .in("id", ids);

  if (makgeolliError) throw makgeolliError;

  // counts 순서대로 재정렬
  const byId = new Map(
    (makgeollis ?? []).map((m) => [(m as Makgeolli).id, m as Makgeolli]),
  );
  return ids
    .map((id) => byId.get(id))
    .filter((m): m is Makgeolli => m !== undefined);
}
