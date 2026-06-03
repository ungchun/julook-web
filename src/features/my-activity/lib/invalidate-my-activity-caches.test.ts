import { describe, it, expect, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { invalidateMyActivityCaches } from "./invalidate-my-activity-caches";

// Phase 1 RED — 신규 헬퍼 `invalidateMyActivityCaches` 단위 테스트.
// iOS MainCoordinator.refreshMyMakgeollis 1:1 미러.
// 단일 prefix ["my-activity"] 1회 호출로 list 3종 + decoration 2종을 모두 무효화.

describe("invalidateMyActivityCaches", () => {
  it("invalidates queries with prefix ['my-activity'] exactly once", () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const spy = vi.spyOn(client, "invalidateQueries");

    invalidateMyActivityCaches(client);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["my-activity"] }),
    );
  });

  it("invalidation matches decoration queryKeys via prefix matching", async () => {
    // prefix matching 통합 검증 — ["my-activity", "decorations", ...] 같이
    // 길이가 더 긴 queryKey 도 ["my-activity"] prefix 한 번으로 stale 처리되어야 한다.
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    // 미리 cache 에 ["my-activity", ...] prefix 의 다양한 query 를 채워두고
    // invalidate 후 isInvalidated() 가 true 가 되는지 확인.
    const decorationReactionsKey = [
      "my-activity",
      "decorations",
      "reactions",
      "user-x",
    ];
    const decorationCommentsKey = [
      "my-activity",
      "decorations",
      "comments",
      "user-x",
    ];
    const listAllKey = ["my-activity", "all", "user-x"];

    client.setQueryData(decorationReactionsKey, []);
    client.setQueryData(decorationCommentsKey, []);
    client.setQueryData(listAllKey, []);

    invalidateMyActivityCaches(client);

    const cache = client.getQueryCache();
    expect(cache.find({ queryKey: decorationReactionsKey })?.state.isInvalidated).toBe(true);
    expect(cache.find({ queryKey: decorationCommentsKey })?.state.isInvalidated).toBe(true);
    expect(cache.find({ queryKey: listAllKey })?.state.isInvalidated).toBe(true);
  });
});
