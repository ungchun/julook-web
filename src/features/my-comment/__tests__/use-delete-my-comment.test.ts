import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { useDeleteMyComment } from "../use-delete-my-comment";

const deleteMyCommentMock = vi.fn();
const useUserIdMock = vi.fn();

vi.mock("@/shared/lib/user-comments", () => ({
  fetchMyComment: vi.fn(),
  upsertMyComment: vi.fn(),
  deleteMyComment: (...args: unknown[]) => deleteMyCommentMock(...args),
}));

vi.mock("@/shared/lib/use-user-id", () => ({
  useUserId: () => useUserIdMock(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  deleteMyCommentMock.mockResolvedValue(undefined);
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

describe("useDeleteMyComment", () => {
  it("calls deleteMyComment(userId, makgeolliId) (commentId 무관)", async () => {
    useUserIdMock.mockReturnValue(USER_ID);
    const client = makeClient();

    const { result } = renderHook(() => useDeleteMyComment(MAKGEOLLI_ID), {
      wrapper: wrap(client),
    });

    await act(async () => {
      await result.current.delete();
    });

    expect(deleteMyCommentMock).toHaveBeenCalledTimes(1);
    expect(deleteMyCommentMock).toHaveBeenCalledWith(USER_ID, MAKGEOLLI_ID);
  });

  it("throws when userId is not loaded", async () => {
    useUserIdMock.mockReturnValue(undefined);
    const client = makeClient();

    const { result } = renderHook(() => useDeleteMyComment(MAKGEOLLI_ID), {
      wrapper: wrap(client),
    });

    await expect(result.current.delete()).rejects.toThrow(/userId not loaded/i);
    expect(deleteMyCommentMock).not.toHaveBeenCalled();
  });

  it("on success, invalidates 5 prefix query keys", async () => {
    useUserIdMock.mockReturnValue(USER_ID);
    const client = makeClient();
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => useDeleteMyComment(MAKGEOLLI_ID), {
      wrapper: wrap(client),
    });

    await act(async () => {
      await result.current.delete();
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalled();
    });

    const calledPrefixes = invalidateSpy.mock.calls.map((call) => {
      const arg = call[0] as { queryKey?: readonly unknown[] } | undefined;
      return arg?.queryKey?.[0];
    });

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

  it("when delete is triggered, optimistically sets cache to null before the server resolves", async () => {
    useUserIdMock.mockReturnValue(USER_ID);

    let resolveDelete: (() => void) | undefined;
    deleteMyCommentMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveDelete = resolve;
        }),
    );

    const client = makeClient();
    const queryKey = [
      "my-comment",
      "by-makgeolli",
      USER_ID,
      MAKGEOLLI_ID,
    ] as const;
    const previousComment = {
      id: "to-be-deleted",
      user_id: USER_ID,
      makgeolli_id: MAKGEOLLI_ID,
      comment: "삭제될 코멘트",
      is_public: true,
      created_at: "2025-03-01T00:00:00Z",
      updated_at: "2025-03-02T00:00:00Z",
    };
    client.setQueryData(queryKey, previousComment);

    const { result } = renderHook(() => useDeleteMyComment(MAKGEOLLI_ID), {
      wrapper: wrap(client),
    });

    let deletePromise: Promise<void> | undefined;
    act(() => {
      deletePromise = result.current.delete();
    });

    // onMutate 직후, 서버 응답 전 cache 가 null 로 채워져 있어야 한다.
    await waitFor(() => {
      expect(client.getQueryData(queryKey)).toBeNull();
    });

    await act(async () => {
      resolveDelete?.();
      await deletePromise;
    });
  });

  it("when delete fails, rolls back cache to the previous comment via onError context (cache transitions: previous → null → previous)", async () => {
    useUserIdMock.mockReturnValue(USER_ID);
    deleteMyCommentMock.mockRejectedValue(new Error("delete failed"));

    const client = makeClient();
    const queryKey = [
      "my-comment",
      "by-makgeolli",
      USER_ID,
      MAKGEOLLI_ID,
    ] as const;
    const previousComment = {
      id: "rollback-delete-id",
      user_id: USER_ID,
      makgeolli_id: MAKGEOLLI_ID,
      comment: "삭제 실패 시 복원될 코멘트",
      is_public: false,
      created_at: "2025-03-10T00:00:00Z",
      updated_at: "2025-03-11T00:00:00Z",
    };
    client.setQueryData(queryKey, previousComment);

    // setQueryData 호출 시퀀스를 캡쳐 — 낙관 null 설정과 롤백 두 호출이 모두 발생했는지 검증.
    // (단순히 최종 cache 값만 보면 onMutate/onError 둘 다 없을 때도 통과해버린다.)
    const setSpy = vi.spyOn(client, "setQueryData");

    const { result } = renderHook(() => useDeleteMyComment(MAKGEOLLI_ID), {
      wrapper: wrap(client),
    });

    await act(async () => {
      await expect(result.current.delete()).rejects.toThrow(/delete failed/);
    });

    const callsForOurKey = setSpy.mock.calls.filter(
      ([k]) =>
        Array.isArray(k) &&
        k[0] === "my-comment" &&
        k[1] === "by-makgeolli" &&
        k[2] === USER_ID &&
        k[3] === MAKGEOLLI_ID,
    );
    // 최소 2회: onMutate 의 null 설정 + onError 의 previous 복원.
    expect(callsForOurKey.length).toBeGreaterThanOrEqual(2);

    // 두 호출 값 시퀀스: 첫 호출은 null (낙관 삭제), 마지막 호출은 previousComment (롤백).
    const firstCallValue = callsForOurKey[0]?.[1];
    expect(firstCallValue).toBeNull();
    const lastCallValue = callsForOurKey[callsForOurKey.length - 1]?.[1];
    expect(lastCallValue).toEqual(previousComment);

    // 최종 cache 도 previousComment 로 복원되어 있어야 한다.
    await waitFor(() => {
      expect(client.getQueryData(queryKey)).toEqual(previousComment);
    });
  });
});
