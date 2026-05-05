import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Makgeolli } from "@/shared/types";
import { fetchMakgeollisByFilter } from "./api";
import { getFilterMeta, type FilterSlug } from "./types";

// slug 가 정의되지 않거나 매핑에 없으면 fetch 비활성.
export function useFilteredMakgeollis(
  slug: FilterSlug | undefined,
): UseQueryResult<Makgeolli[], Error> {
  return useQuery({
    queryKey: ["makgeolli", "by-filter", slug] as const,
    queryFn: () => fetchMakgeollisByFilter(slug!),
    enabled: !!slug && getFilterMeta(slug) !== undefined,
  });
}
