import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { MakgeolliGridCard } from "@/features/makgeolli-list";
import {
  RecentSearches,
  useRecentSearches,
  useSearch,
} from "@/features/search";
import { RegisterRequestDialog } from "@/features/search/RegisterRequestDialog";
import { useRequestRegister } from "@/features/search/use-request-register";
import {
  getPersistedSearchQuery,
  setPersistedSearchQuery,
} from "@/features/search/search-persistence";
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
  // 재진입(Detail → 뒤로) 시 직전 검색어 복원 — persistence 없으면 빈 문자열.
  const [rawQuery, setRawQuery] = useState(() => getPersistedSearchQuery());
  const debouncedQuery = useDebouncedValue(rawQuery.trim(), 300);

  useEffect(() => {
    setPersistedSearchQuery(rawQuery);
  }, [rawQuery]);
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

  const inputRef = useRef<HTMLInputElement | null>(null);
  const { request, isPending: isRequesting } = useRequestRegister();
  const [showRequestDone, setShowRequestDone] = useState(false);

  const onRequestRegister = async () => {
    if (isRequesting) return;
    try {
      await request(debouncedQuery);
      setShowRequestDone(true);
    } catch {
      // 실패는 silent — iOS도 사용자에게 노출 안 함 (검색 흐름 비차단).
    }
  };

  // iOS SearchCore.searchSubmitted 미러 — 빈 검색어는 무시, 그렇지 않으면 add.
  // submit 후 input.blur() 호출 — 모바일 키보드를 자동으로 내림.
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void recent.add(rawQuery);
    inputRef.current?.blur();
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>검색</h1>
      <form className={styles.inputRow} onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="search"
          className={styles.input}
          value={rawQuery}
          onChange={(e) => setRawQuery(e.target.value)}
          placeholder="막걸리 이름, 양조장 ..."
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
      </form>

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
        <div className={styles.centerSlot}>
          <EmptyState message="막걸리 이름으로 검색해보세요!" />
        </div>
      )}
      {debouncedQuery.length > 0 && isLoading && <LoadingState />}
      {debouncedQuery.length > 0 && isError && (
        <ErrorState onRetry={() => refetch()} />
      )}
      {debouncedQuery.length > 0 && !isError && data?.length === 0 && (
        <div className={styles.emptyResult}>
          <p className={styles.emptyMessage}>
            {`'${debouncedQuery}' 검색 결과가 없어요.`}
          </p>
          <button
            type="button"
            className={styles.requestButton}
            onClick={() => void onRequestRegister()}
            disabled={isRequesting}
          >
            등록 요청하기
          </button>
        </div>
      )}
      {data != null && data.length > 0 && (
        <div className={styles.list}>
          {displayed.map((m) => (
            <MakgeolliGridCard
              key={m.id}
              makgeolli={m}
              onClick={() => goDetail(m.id)}
            />
          ))}
          {hasMore && <InfiniteListSentinel onIntersect={loadMore} />}
        </div>
      )}
      <RegisterRequestDialog
        open={showRequestDone}
        onClose={() => setShowRequestDone(false)}
      />
    </main>
  );
}
