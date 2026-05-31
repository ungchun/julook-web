import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MakgeolliGridCard } from "@/features/makgeolli-list";
import {
  applySort,
  FILTER_META,
  FilterChips,
  getFilterMeta,
  SortSelector,
  useInfiniteFilteredMakgeollis,
  type FilterSlug,
  type SortOption,
} from "@/features/filter";
import { PageNav } from "@/shared/ui/PageNav";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { InfiniteListSentinel } from "@/shared/ui/InfiniteListSentinel";
import styles from "./Filter.module.css";

const ALL_SLUGS = Object.keys(FILTER_META) as FilterSlug[];

// /filter/:type — URL 진입 칩으로 초기화. 칩 multi-select + 클라이언트 정렬은 내부 state.
// iOS FilterCore 미러: pageSize 10 서버 페이지네이션 + 클라이언트 sort.
// 정렬 변경은 서버 재조회 없이 누적된 페이지를 클라이언트에서만 다시 정렬.
export function Filter() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const meta = type != null ? getFilterMeta(type) : undefined;

  const [selected, setSelected] = useState<Set<FilterSlug>>(() => {
    const initial = new Set<FilterSlug>();
    if (meta != null) initial.add(meta.slug);
    return initial;
  });
  const [sort, setSort] = useState<SortOption>("recommended");

  const slugsArray = useMemo(() => Array.from(selected), [selected]);
  const isSupported = type == null || meta != null;
  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteFilteredMakgeollis(slugsArray, isSupported);

  const allItems = useMemo(
    () => (data?.pages ?? []).flat(),
    [data],
  );
  const displayed = useMemo(() => applySort(allItems, sort), [allItems, sort]);

  const toggle = (slug: FilterSlug) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
    // iOS applyFilters 미러 — 필터 변경 시 정렬 recommended로 리셋
    setSort("recommended");
  };

  const onSentinel = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  return (
    <main
      className={styles.main}
      style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 60 }}
    >
      <PageNav onClose={() => navigate(-1)} title="특징으로 찾기" />

      {meta == null && type != null && (
        <EmptyState message="지원하지 않는 필터입니다" />
      )}
      {(meta != null || type == null) && (
        <>
          <FilterChips
            slugs={ALL_SLUGS}
            selected={selected}
            onToggle={toggle}
          />

          <SortSelector value={sort} onChange={setSort} />

          {isLoading && <LoadingState />}
          {isError && <ErrorState onRetry={() => refetch()} />}
          {!isError && !isLoading && displayed.length === 0 && (
            <EmptyState message="결과가 없어요" />
          )}
          {displayed.length > 0 && (
            <div className={styles.list}>
              {displayed.map((m) => (
                <MakgeolliGridCard
                  key={m.id}
                  makgeolli={m}
                  onClick={() => navigate(`/makgeolli/${m.id}`)}
                />
              ))}
            </div>
          )}
          {hasNextPage && (
            <InfiniteListSentinel onIntersect={onSentinel} />
          )}
          {isFetchingNextPage && <LoadingState />}
        </>
      )}
    </main>
  );
}
