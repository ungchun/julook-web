import type { QueryClient } from "@tanstack/react-query";

// 코멘트 mutation(저장/삭제) 성공 시 무효화해야 하는 5 prefix.
// Phase 0 §invalidate queryKey 전체 목록 참조 — 명시적 8개 queryKey 를
// React Query 의 prefix matching 으로 5 prefix 에 압축.
//
// 호출 시그니처는 인라인 호출과 동일 (`{ queryKey: [...] }`) — Hook 테스트의
// invalidate 스파이 호출 인자 검증을 보존한다.
const COMMENT_INVALIDATE_PREFIXES: ReadonlyArray<readonly string[]> = [
  ["my-comment"],
  ["user-comments"],
  ["recent-comments"],
  ["all-public-comments"],
  ["my-activity"],
];

export function invalidateCommentCaches(queryClient: QueryClient): void {
  for (const prefix of COMMENT_INVALIDATE_PREFIXES) {
    queryClient.invalidateQueries({ queryKey: prefix });
  }
}
