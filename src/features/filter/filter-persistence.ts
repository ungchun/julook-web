import type { FilterSlug } from "./types";
import type { SortOption } from "./sort";

// URL pathname (예: "/filter/thick" / "/filter") 별로 선택 칩 + 정렬 상태를 기억.
// Filter 페이지를 떠났다가 (Detail 등) 같은 URL 로 돌아왔을 때 사용자의 선택을 복원.
// 모듈 레벨 Map — 풀 페이지 리로드 시엔 초기화 (의도된 동작).
type PersistedFilterState = {
  selected: ReadonlyArray<FilterSlug>;
  sort: SortOption;
};

const cache = new Map<string, PersistedFilterState>();

export function getPersistedFilterState(
  key: string,
): PersistedFilterState | undefined {
  return cache.get(key);
}

export function setPersistedFilterState(
  key: string,
  state: PersistedFilterState,
): void {
  cache.set(key, state);
}

// 테스트 전용 — afterEach 에서 Map 을 비워 케이스간 격리.
export function __resetFilterPersistenceForTest(): void {
  cache.clear();
}
