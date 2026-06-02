import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Makgeolli } from "@/shared/types";
import { fetchMakgeollisByIds } from "./api";
import { useFavorites } from "./use-favorites";

// 찜한 막걸리 객체 리스트. favorites id 배열을 정렬해 key 안정성 확보 →
// 동일 set 이면 캐시 hit. 빈 배열이면 fetch 자체를 skip.
export function useFavoriteMakgeollis(): UseQueryResult<Makgeolli[], Error> {
  const { favorites } = useFavorites();
  const ids = [...favorites].sort();
  const key = ids.join(",");

  return useQuery({
    queryKey: ["favorites", "makgeollis", key] as const,
    queryFn: () => fetchMakgeollisByIds(ids),
    enabled: ids.length > 0,
  });
}
