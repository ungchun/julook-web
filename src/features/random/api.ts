import { supabase } from "@/shared/lib/supabase";
import type { Makgeolli } from "@/shared/types";

const RANDOM_LIMIT = 5;

// iOS fetchRandomMakgeollis 미러 — 전체 select 후 클라이언트 shuffle prefix 5.
// (iOS 본앱과 동일 — 막걸리 row 수가 적어서 클라이언트 shuffle도 부담 작음.)
export async function fetchRandomMakgeollis(): Promise<Makgeolli[]> {
  const { data, error } = await supabase.from("makgeolli").select("*");

  if (error) throw error;
  if (!data) return [];

  const shuffled = [...(data as Makgeolli[])];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, RANDOM_LIMIT);
}
