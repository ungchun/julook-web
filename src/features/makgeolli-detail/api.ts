import { supabase } from "@/shared/lib/supabase";
import type { Makgeolli } from "@/shared/types";

// iOS 본앱 미러: from("makgeolli").select().eq("id", id) → 단건.
// maybeSingle은 0건이면 null, 1건이면 객체, 2건+면 error 반환.
export async function fetchMakgeolliById(
  id: string,
): Promise<Makgeolli | null> {
  const { data, error } = await supabase
    .from("makgeolli")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as Makgeolli | null) ?? null;
}
