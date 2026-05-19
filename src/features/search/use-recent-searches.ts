import { useCallback, useEffect, useState } from "react";
import {
  loadRecentSearches,
  saveRecentSearches,
} from "@/shared/lib/recent-searches";

const MAX_ITEMS = 10;

export function useRecentSearches() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadRecentSearches().then((loaded) => {
      if (!cancelled) setItems(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: string[]) => {
    setItems(next);
    await saveRecentSearches(next);
  }, []);

  const add = useCallback(
    async (keyword: string) => {
      const trimmed = keyword.trim();
      if (trimmed === "") return;
      setItems((prev) => {
        const deduped = prev.filter((item) => item !== trimmed);
        const next = [trimmed, ...deduped].slice(0, MAX_ITEMS);
        // 비동기 저장 — fire-and-forget; 다음 mount 에서 다시 load.
        void saveRecentSearches(next);
        return next;
      });
    },
    [],
  );

  const removeAt = useCallback(
    async (idx: number) => {
      setItems((prev) => {
        const next = prev.filter((_, i) => i !== idx);
        void saveRecentSearches(next);
        return next;
      });
    },
    [],
  );

  const clearAll = useCallback(async () => {
    await persist([]);
  }, [persist]);

  return { items, add, removeAt, clearAll };
}
