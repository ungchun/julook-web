import { supabase } from "@/shared/lib/supabase";
import type { Makgeolli } from "@/shared/types";

const NEW_RELEASES_LIMIT = 5;

export async function fetchNewReleases(): Promise<Makgeolli[]> {
  const { data, error } = await supabase
    .from("makgeolli")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(NEW_RELEASES_LIMIT);

  if (error) throw error;
  if (!data) throw new Error("Failed to fetch new releases: empty response");

  return data as Makgeolli[];
}
