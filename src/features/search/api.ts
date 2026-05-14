import { supabase } from "@/shared/lib/supabase";
import type { Makgeolli } from "@/shared/types";

// iOS searchMakgeollis 미러 — search_makgeolli_flexible RPC (공백 무시 검색).
export async function searchMakgeollis(query: string): Promise<Makgeolli[]> {
  const { data, error } = await supabase.rpc("search_makgeolli_flexible", {
    search_query: query,
  });
  if (error) throw error;
  return (data ?? []) as Makgeolli[];
}
