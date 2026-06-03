import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { useSaveMyComment } from "../use-save-my-comment";

const upsertMyCommentMock = vi.fn();
const useUserIdMock = vi.fn();

vi.mock("@/shared/lib/user-comments", () => ({
  fetchMyComment: vi.fn(),
  upsertMyComment: (...args: unknown[]) => upsertMyCommentMock(...args),
  deleteMyComment: vi.fn(),
}));

vi.mock("@/shared/lib/use-user-id", () => ({
  useUserId: () => useUserIdMock(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  upsertMyCommentMock.mockResolvedValue(undefined);
});

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

describe("useSaveMyComment", () => {
  it("calls upsertMyComment with userId, makgeolliId, comment, isPublic", async () => {
    useUserIdMock.mockReturnValue(USER_ID);
    const client = makeClient();

    const { result } = renderHook(() => useSaveMyComment(MAKGEOLLI_ID), {
      wrapper: wrap(client),
    });

    await act(async () => {
      await result.current.save({ comment: "테스트", isPublic: true });
    });

    expect(upsertMyCommentMock).toHaveBeenCalledTimes(1);
    expect(upsertMyCommentMock).toHaveBeenCalledWith({
      userId: USER_ID,
      makgeolliId: MAKGEOLLI_ID,
      comment: "테스트",
      isPublic: true,
    });
  });

  it("throws when userId is not loaded (mirrors useReaction pattern)", async () => {
    useUserIdMock.mockReturnValue(undefined);
    const client = makeClient();

    const { result } = renderHook(() => useSaveMyComment(MAKGEOLLI_ID), {
      wrapper: wrap(client),
    });

    await expect(
      result.current.save({ comment: "x", isPublic: true }),
    ).rejects.toThrow(/userId not loaded/i);
    expect(upsertMyCommentMock).not.toHaveBeenCalled();
  });

  it("on success, invalidates 5 prefix query keys (my-comment / user-comments / recent-comments / all-public-comments / my-activity)", async () => {
    useUserIdMock.mockReturnValue(USER_ID);
    const client = makeClient();
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useSaveMyComment(MAKGEOLLI_ID), {
      wrapper: wrap(client),
    });

    await act(async () => {
      await result.current.save({ comment: "x", isPublic: true });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalled();
    });

    const calledPrefixes = invalidateSpy.mock.calls.map((call) => {
      const arg = call[0] as { queryKey?: readonly unknown[] } | undefined;
      return arg?.queryKey?.[0];
    });

    // 5 prefix 모두 무효화되어야 한다 (Phase 0 §invalidate queryKey 전체 목록 참조)
    expect(calledPrefixes).toEqual(
      expect.arrayContaining([
        "my-comment",
        "user-comments",
        "recent-comments",
        "all-public-comments",
        "my-activity",
      ]),
    );
  });

  it("exposes isPending while the upsert is in flight", async () => {
    useUserIdMock.mockReturnValue(USER_ID);
    let resolveUpsert: (() => void) | undefined;
    upsertMyCommentMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveUpsert = resolve;
        }),
    );
    const client = makeClient();

    const { result } = renderHook(() => useSaveMyComment(MAKGEOLLI_ID), {
      wrapper: wrap(client),
    });

    let savePromise: Promise<void> | undefined;
    act(() => {
      savePromise = result.current.save({ comment: "x", isPublic: true });
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    await act(async () => {
      resolveUpsert?.();
      await savePromise;
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
});
