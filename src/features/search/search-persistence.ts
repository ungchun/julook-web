// 검색창 입력값 영속화 — Search 페이지 재진입(Detail → 뒤로) 시 직전 검색어 복원.
// 모듈 레벨 단일 값 — 풀 페이지 리로드 시엔 초기화 (의도된 동작).
let cached: string = "";

export function getPersistedSearchQuery(): string {
  return cached;
}

export function setPersistedSearchQuery(value: string): void {
  cached = value;
}

// 테스트 전용.
export function __resetSearchPersistenceForTest(): void {
  cached = "";
}
