import { useEffect, useState, useCallback } from "react";

// items 변경 시 자동으로 첫 페이지로 리셋되는 클라이언트 페이지네이션 훅.
// 서버 변경 0건 정책상 RPC 전체 결과를 받아 렌더링만 N개씩 보여준다.
export function usePaginatedList<T>(
  items: T[],
  pageSize: number,
): { displayed: T[]; hasMore: boolean; loadMore: () => void } {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [items]);

  const limit = page * pageSize;
  const displayed = items.slice(0, limit);
  const hasMore = items.length > displayed.length;

  const loadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  return { displayed, hasMore, loadMore };
}
