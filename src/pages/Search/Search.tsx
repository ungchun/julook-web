import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MakgeolliCard } from "@/features/makgeolli-list";
import { useSearch } from "@/features/search";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LoadingState } from "@/shared/ui/LoadingState";
import styles from "./Search.module.css";

// iOS SearchView 1차 단순화 — 최근 검색어/Cancel/focus 처리는 비범위 (후속 사이클).
// search_makgeolli_flexible RPC 사용, 300ms debounce.
export function Search() {
  const [rawQuery, setRawQuery] = useState("");
  const debouncedQuery = useDebouncedValue(rawQuery.trim(), 300);
  const { data, isLoading, isError, refetch } = useSearch(debouncedQuery);
  const navigate = useNavigate();

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

      {debouncedQuery.length === 0 && (
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
          {data.map((m) => (
            <MakgeolliCard
              key={m.id}
              makgeolli={m}
              onClick={() => navigate(`/makgeolli/${m.id}`)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
