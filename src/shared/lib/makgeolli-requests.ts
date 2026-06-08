import { supabase } from "./supabase";

// iOS SupabaseClientLive+Makgeolli.swift:129 (requestRegisterMakgeolli) 1:1 미러.
// makgeolli_requests 테이블에 사용자 검색어를 그대로 insert. 응답 본문 불필요.
export async function requestRegisterMakgeolli(searchText: string): Promise<void> {
  const { error } = await supabase
    .from("makgeolli_requests")
    .insert({ search_text: searchText });
  if (error) throw error;
}
