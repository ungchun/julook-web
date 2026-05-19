import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MakgeolliCard } from "@/features/makgeolli-list";
import {
  RecentSearches,
  useRecentSearches,
  useSearch,
} from "@/features/search";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { usePaginatedList } from "@/shared/lib/use-paginated-list";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { InfiniteListSentinel } from "@/shared/ui/InfiniteListSentinel";
import { LoadingState } from "@/shared/ui/LoadingState";
import styles from "./Search.module.css";

const SEARCH_PAGE_SIZE = 20;

// iOS SearchView 미러 — 1차(입력+디바운스+결과) + 2차(최근 검색어 영속화).
// search_makgeolli_flexible RPC 사용, 300ms debounce.
// 최근 검색어는 카드 클릭 시점에 add() — "이 검색어로 탐색했다"는 명확한 의도.
export function Search() {
  const [rawQuery, setRawQuery] = useState("");
  const debouncedQuery = useDebouncedValue(rawQuery.trim(), 300);
  const { data, isLoading, isError, refetch } = useSearch(debouncedQuery);
  const recent = useRecentSearches();
  const navigate = useNavigate();
  const results = data ?? [];
  const { displayed, hasMore, loadMore } = usePaginatedList(
    results,
    SEARCH_PAGE_SIZE,
  );

  const goDetail = (id: string) => {
    void recent.add(debouncedQuery);
    navigate(`/makgeolli/${id}`);
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>검색</h1>
      <div className={styles.inputRow}>
        <input
          type="search"
          className={styles.input}
          value={rawQuery}
          onChange={(e) => setRawQuery(e.target.value)}
          placeholder="막걸리 이름"
        />
        {rawQuery.length > 0 && (
          <button
            type="button"
            className={styles.clearButton}
            aria-label="지우기"
            onClick={() => setRawQuery("")}
          >
            ×
          </button>
        )}
      </div>

      {debouncedQuery.length === 0 && recent.items.length > 0 && (
        <RecentSearches
          items={recent.items}
          onSelect={(keyword) => setRawQuery(keyword)}
          onRemove={(idx) => {
            void recent.removeAt(idx);
          }}
          onClearAll={() => {
            void recent.clearAll();
          }}
        />
      )}
      {debouncedQuery.length === 0 && recent.items.length === 0 && (
        <EmptyState message="막걸리 이름을 검색해 보세요" />
      )}
      {debouncedQuery.length > 0 && isLoading && <LoadingState />}
      {debouncedQuery.length > 0 && isError && (
        <ErrorState onRetry={() => refetch()} />
      )}
      {debouncedQuery.length > 0 && !isError && data?.length === 0 && (
        <EmptyState message="검색 결과가 없어요" />
      )}
      {data != null && data.length > 0 && (
        <div className={styles.list}>
          {displayed.map((m) => (
            <MakgeolliCard
              key={m.id}
              makgeolli={m}
              onClick={() => goDetail(m.id)}
            />
          ))}
          {hasMore && <InfiniteListSentinel onIntersect={loadMore} />}
        </div>
      )}
    </main>
  );
}
