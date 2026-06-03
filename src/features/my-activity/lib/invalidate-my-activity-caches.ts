import type { QueryClient } from "@tanstack/react-query";

/**
 * 내 활동 페이지의 모든 query 를 단일 prefix 로 무효화한다.
 *
 * iOS MainCoordinator 의 `refreshMyMakgeollis` 액션 1:1 미러.
 * - `["my-activity"]` prefix 하나로 list 3종 (`all` / `reaction` / `comment`) +
 *   decoration 2종 (`decorations.reactions` / `decorations.comments`) 까지 모두 매칭.
 * - reaction toggle / favorite toggle / comment save·delete mutation 의 onSuccess 에서 호출.
 *
 * decoration query 들은 이 헬퍼와의 정합성을 위해 queryKey 가
 * `["my-activity", "decorations", ...]` 로 일원화돼 있어야 한다.
 */
export function invalidateMyActivityCaches(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: ["my-activity"] });
}
