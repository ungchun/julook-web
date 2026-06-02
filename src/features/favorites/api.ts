import { supabase } from "@/shared/lib/supabase";
import type { Makgeolli } from "@/shared/types";

// 찜한 막걸리 id 배열로 makgeolli 테이블 일괄 조회.
// id 가 비어있으면 호출하지 않도록 hook 단에서 enabled 로 제어.
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
