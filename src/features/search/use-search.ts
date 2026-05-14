import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Makgeolli } from "@/shared/types";
import { searchMakgeollis } from "./api";

// 빈 키워드면 fetch 비활성. 호출자는 디바운스된 값을 전달해야 함.
export function useSearch(
  query: string,
): UseQueryResult<Makgeolli[], Error> {
  return useQuery({
    queryKey: ["search", "makgeolli", query] as const,
    queryFn: () => searchMakgeollis(query),
    enabled: query.length > 0,
  });
}
