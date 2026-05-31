import { supabase } from "@/shared/lib/supabase";
import type { Makgeolli } from "@/shared/types";
import { FILTER_META, type FilterSlug } from "./types";

// iOS fetchFilteredMakgeollis (SupabaseClientLive+Makgeolli.swift:55-82) 미러.
// 단일 slug 진입 deep link 호환용으로 유지.
export async function fetchMakgeollisByFilter(
  slug: FilterSlug,
): Promise<Makgeolli[]> {
  return fetchMakgeollisByFilters([slug]);
}

// iOS fetchFilteredMakgeollis multi 케이스 — Set<FilterType> 미러.
// 0개면 predicate 없이 전체 fetch, N개면 각 column에 gte/eq를 순차 AND 적용.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyPredicate(builder: any, slug: FilterSlug): any {
  const meta = FILTER_META[slug];
  return meta.predicate.op === "gte"
    ? builder.gte(meta.column, meta.predicate.value)
    : builder.eq(meta.column, meta.predicate.value);
}

export async function fetchMakgeollisByFilters(
  slugs: FilterSlug[],
): Promise<Makgeolli[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = supabase.from("makgeolli").select("*");
  for (const slug of slugs) {
    q = applyPredicate(q, slug);
  }

  const { data, error } = await q
    .order("id", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Makgeolli[];
}
