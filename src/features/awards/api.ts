import { supabase } from "@/shared/lib/supabase";
import type { Award, Makgeolli } from "@/shared/types";

// awards 테이블에서 단일 award 조회 (페이지 헤더용).
export async function fetchAwardById(id: string): Promise<Award | null> {
  const { data, error } = await supabase
    .from("awards")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as Award | null) ?? null;
}

// iOS fetchMakgeollisByAward (SupabaseClientLive+Makgeolli.swift:84-98) 미러.
// awards 컬럼은 [String]?, contains(name) 으로 매칭.
export async function fetchMakgeollisByAwardName(
  name: string,
): Promise<Makgeolli[]> {
  const { data, error } = await supabase
    .from("makgeolli")
    .select("*")
    .contains("awards", [name])
    .order("id", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Makgeolli[];
}
