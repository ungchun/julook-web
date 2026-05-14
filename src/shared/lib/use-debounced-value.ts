import { useEffect, useState } from "react";

// 입력이 잠시 멈췄을 때만 새 값을 노출 — 검색 입력 → fetch 트리거 사이의 trigger 빈도를 줄인다.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebounced(value);
    }, delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);

  return debounced;
}
