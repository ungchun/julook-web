import { supabase } from "@/shared/lib/supabase";
import type { Makgeolli } from "@/shared/types";

// 찜한 막걸리 id 배열로 makgeolli 테이블 일괄 조회.
// ids 가 비면 supabase 호출 없이 [] 반환 — hook 계약 "로드 완료 후 항상 data: T[]" 보장.
export async function fetchMakgeollisByIds(
  ids: ReadonlyArray<string>,
): Promise<Makgeolli[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("makgeolli")
    .select("*")
    .in("id", ids as string[]);
  if (error) throw error;
  return (data ?? []) as Makgeolli[];
}
