import { supabase } from "@/shared/lib/supabase";
import type { Makgeolli } from "@/shared/types";
import { FILTER_META, type FilterSlug } from "./types";

// iOS fetchFilteredMakgeollis (SupabaseClientLive+Makgeolli.swift:55-82) 미러.
// 다중 필터(Set<FilterType>) 미지원 — 단일 slug 만. 페이지네이션도 1단계 미지원.
export async function fetchMakgeollisByFilter(
  slug: FilterSlug,
): Promise<Makgeolli[]> {
  const meta = FILTER_META[slug];
  const base = supabase.from("makgeolli").select("*");
  const filtered =
    meta.predicate.op === "gte"
      ? base.gte(meta.column, meta.predicate.value)
      : base.eq(meta.column, meta.predicate.value);

  const { data, error } = await filtered
    .order("id", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Makgeolli[];
}
