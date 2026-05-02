import { supabase } from "@/shared/lib/supabase";
import type { Award } from "@/shared/types";

const AWARDS_LIMIT = 5;

// iOS fetchAwards 미러 — year desc, limit 5.
export async function fetchAwards(): Promise<Award[]> {
  const { data, error } = await supabase
    .from("awards")
    .select("*")
    .order("year", { ascending: false })
    .limit(AWARDS_LIMIT);

  if (error) throw error;
  return (data as Award[]) ?? [];
}
