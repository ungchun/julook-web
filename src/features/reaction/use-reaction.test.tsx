import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { useReaction } from "./use-reaction";

// Phase 1 RED — `useReaction.toggle` 성공 시 my-activity prefix 가 무효화되는지 검증.
// iOS InformationCore+Effects.swift:78-90 의 .reactionSaved → refreshMyMakgeollis 미러.
// 현재 use-reaction.ts:42-49 onSuccess 는 reaction 2개 prefix 만 무효화 → 본 테스트 실패.

const fetchUserReactionMock = vi.fn();
const fetchReactionCountsMock = vi.fn();
const saveReactionMock = vi.fn();
const deleteReactionMock = vi.fn();

vi.mock("./api", () => ({
  fetchUserReaction: (...args: unknown[]) => fetchUserReactionMock(...args),
  fetchReactionCounts: (...args: unknown[]) => fetchReactionCountsMock(...args),
  saveReaction: (...args: unknown[]) => saveReactionMock(...args),
  deleteReaction: (...args: unknown[]) => deleteReactionMock(...args),
}));

const useUserIdMock = vi.fn();
vi.mock("@/shared/lib/use-user-id", () => ({
  useUserId: () => useUserIdMock(),
}));

const USER_ID = "user-fixture-id";
const MAKGEOLLI_ID = "makgeolli-fixture-id";

function makeClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function wrap(client: QueryClient) {
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
}

beforeEach(() => {
  vi.clearAllMocks();
  useUserIdMock.mockReturnValue(USER_ID);
  fetchUserReactionMock.mockResolvedValue(null);
  fetchReactionCountsMock.mockResolvedValue({ like_count: 0, dislike_count: 0 });
  saveReactionMock.mockResolvedValue(undefined);
  deleteReactionMock.mockResolvedValue(undefined);
});

describe("useReaction.toggle (my-activity invalidation)", () => {
  it("when toggle(like) succeeds, invalidates ['my-activity'] prefix", async () => {
    const client = makeClient();
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useReaction(MAKGEOLLI_ID), {
      wrapper: wrap(client),
    });

    // userReactionQuery 가 로드된 후 toggle.
    await waitFor(() => {
      expect(fetchUserReactionMock).toHaveBeenCalled();
    });

    act(() => {
      result.current.toggle("like");
    });

    await waitFor(() => {
      expect(saveReactionMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      const calledPrefixes = invalidateSpy.mock.calls.map((call) => {
        const arg = call[0] as { queryKey?: readonly unknown[] } | undefined;
        return arg?.queryKey?.[0];
      });
      expect(calledPrefixes).toContain("my-activity");
    });
  });

  it("when toggle(dislike) succeeds, invalidates ['my-activity'] prefix", async () => {
    const client = makeClient();
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useReaction(MAKGEOLLI_ID), {
      wrapper: wrap(client),
    });

    await waitFor(() => {
      expect(fetchUserReactionMock).toHaveBeenCalled();
    });

    act(() => {
      result.current.toggle("dislike");
    });

    await waitFor(() => {
      expect(saveReactionMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      const calledPrefixes = invalidateSpy.mock.calls.map((call) => {
        const arg = call[0] as { queryKey?: readonly unknown[] } | undefined;
        return arg?.queryKey?.[0];
      });
      expect(calledPrefixes).toContain("my-activity");
    });
  });

  it("when toggle succeeds, still invalidates the existing reaction prefixes (no regression)", async () => {
    // 기존 동작 (reaction/user, reaction/counts) 회귀 방지.
    const client = makeClient();
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useReaction(MAKGEOLLI_ID), {
      wrapper: wrap(client),
    });

    await waitFor(() => {
      expect(fetchUserReactionMock).toHaveBeenCalled();
    });

    act(() => {
      result.current.toggle("like");
    });

    await waitFor(() => {
      expect(saveReactionMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      const calledPrefixes = invalidateSpy.mock.calls.map((call) => {
        const arg = call[0] as { queryKey?: readonly unknown[] } | undefined;
        return arg?.queryKey?.[0];
      });
      expect(calledPrefixes).toEqual(
        expect.arrayContaining(["reaction", "reaction", "my-activity"]),
      );
    });
  });

  it("when toggle fails (mutationFn throws), does NOT invalidate any query", async () => {
    saveReactionMock.mockRejectedValue(new Error("network down"));
    const client = makeClient();
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useReaction(MAKGEOLLI_ID), {
      wrapper: wrap(client),
    });

    await waitFor(() => {
      expect(fetchUserReactionMock).toHaveBeenCalled();
    });

    invalidateSpy.mockClear();

    act(() => {
      result.current.toggle("like");
    });

    await waitFor(() => {
      expect(saveReactionMock).toHaveBeenCalled();
    });

    // 짧게 기다려도 onSuccess 가 진입하지 않으므로 invalidate 호출 0회.
    // (React Query 의 mutation 실패는 onError 만 호출하고 onSuccess 는 건너뛴다.)
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
