import {
  useInfiniteQuery,
  useQuery,
  type UseInfiniteQueryResult,
  type InfiniteData,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { Makgeolli } from "@/shared/types";
import {
  fetchMakgeollisByFilter,
  fetchMakgeollisByFilters,
  fetchMakgeollisByFiltersPage,
} from "./api";
import { getFilterMeta, type FilterSlug } from "./types";

// iOS FilterCore pageSize 미러
export const FILTER_PAGE_SIZE = 10;

// slug 가 정의되지 않거나 매핑에 없으면 fetch 비활성. (deep link 단일 진입용)
export function useFilteredMakgeollis(
  slug: FilterSlug | undefined,
): UseQueryResult<Makgeolli[], Error> {
  return useQuery({
    queryKey: ["makgeolli", "by-filter", slug] as const,
    queryFn: () => fetchMakgeollisByFilter(slug!),
    enabled: !!slug && getFilterMeta(slug) !== undefined,
  });
}

// 칩 multi-select 용 — 0개면 전체 fetch, N개면 AND 조합. iOS selectedFilters Set 미러.
// query key는 slug 정렬 후 join하여 순서 무관 캐싱.
// enabled=false 면 unknown deep-link 등 무효 진입 차단.
export function useFilteredMakgeollisMulti(
  slugs: FilterSlug[],
  enabled: boolean = true,
): UseQueryResult<Makgeolli[], Error> {
  const normalized = [...slugs].sort();
  return useQuery({
    queryKey: ["makgeolli", "by-filters", normalized] as const,
    queryFn: () => fetchMakgeollisByFilters(normalized),
    enabled,
  });
}

// iOS FilterCore loadMoreMakgeollis 미러 — 서버 페이지네이션 (pageSize 10).
// hasMore = page.length >= pageSize (마지막 페이지면 < pageSize 라 멈춤).
export function useInfiniteFilteredMakgeollis(
  slugs: FilterSlug[],
  enabled: boolean = true,
): UseInfiniteQueryResult<InfiniteData<Makgeolli[]>, Error> {
  const normalized = [...slugs].sort();
  return useInfiniteQuery({
    queryKey: ["makgeolli", "by-filters-infinite", normalized] as const,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchMakgeollisByFiltersPage(normalized, FILTER_PAGE_SIZE, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < FILTER_PAGE_SIZE) return undefined;
      return allPages.length * FILTER_PAGE_SIZE;
    },
    enabled,
  });
}
