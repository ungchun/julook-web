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

  it("when save is triggered, optimistically sets cache to the new comment before the server resolves (create case → id='optimistic', update case → preserves previous id/created_at)", async () => {
    useUserIdMock.mockReturnValue(USER_ID);

    // upsert 는 서버 응답을 늦춰서, onMutate 이후 onSuccess 이전 시점에 cache 가
    // 낙관 값으로 채워진 것을 확인할 수 있어야 한다.
    let resolveUpsert: (() => void) | undefined;
    upsertMyCommentMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveUpsert = resolve;
        }),
    );

    // ── create 케이스 ──
    const clientCreate = makeClient();
    const queryKey = [
      "my-comment",
      "by-makgeolli",
      USER_ID,
      MAKGEOLLI_ID,
    ] as const;
    // 시작 cache: null (코멘트 없음)
    clientCreate.setQueryData(queryKey, null);

    const { result: createResult } = renderHook(
      () => useSaveMyComment(MAKGEOLLI_ID),
      { wrapper: wrap(clientCreate) },
    );

    let createPromise: Promise<void> | undefined;
    act(() => {
      createPromise = createResult.current.save({
        comment: "낙관적으로 생성된 코멘트",
        isPublic: true,
      });
    });

    // onMutate 가 동기적으로 cache 를 갱신한 직후, 서버 응답 전 cache 값 확인.
    await waitFor(() => {
      const cached = clientCreate.getQueryData(queryKey) as
        | { id: string; comment: string; is_public: boolean }
        | null;
      expect(cached).not.toBeNull();
      expect(cached?.id).toBe("optimistic");
      expect(cached?.comment).toBe("낙관적으로 생성된 코멘트");
      expect(cached?.is_public).toBe(true);
    });

    await act(async () => {
      resolveUpsert?.();
      await createPromise;
    });

    // ── update 케이스 ──
    upsertMyCommentMock.mockReset();
    upsertMyCommentMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveUpsert = resolve;
        }),
    );

    const clientUpdate = makeClient();
    const previousComment = {
      id: "preserved-id-123",
      user_id: USER_ID,
      makgeolli_id: MAKGEOLLI_ID,
      comment: "이전 코멘트",
      is_public: true,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-02T00:00:00Z",
    };
    clientUpdate.setQueryData(queryKey, previousComment);

    const { result: updateResult } = renderHook(
      () => useSaveMyComment(MAKGEOLLI_ID),
      { wrapper: wrap(clientUpdate) },
    );

    let updatePromise: Promise<void> | undefined;
    act(() => {
      updatePromise = updateResult.current.save({
        comment: "수정된 코멘트",
        isPublic: false,
      });
    });

    await waitFor(() => {
      const cached = clientUpdate.getQueryData(queryKey) as
        | {
            id: string;
            comment: string;
            is_public: boolean;
            created_at: string;
          }
        | null;
      expect(cached).not.toBeNull();
      // update 시 기존 id 와 created_at 보존
      expect(cached?.id).toBe("preserved-id-123");
      expect(cached?.created_at).toBe("2025-01-01T00:00:00Z");
      // 새 내용 / 공개 여부 반영
      expect(cached?.comment).toBe("수정된 코멘트");
      expect(cached?.is_public).toBe(false);
    });

    await act(async () => {
      resolveUpsert?.();
      await updatePromise;
    });
  });

  it("when save fails, rolls back cache to the previous value via onError context (cache transitions: previous → optimistic → previous)", async () => {
    useUserIdMock.mockReturnValue(USER_ID);

    // upsert 가 서버 단계에서 실패한다. 단, onMutate(낙관) → mutationFn(실패) 흐름을
    // 명확히 분리하려고 mutationFn 은 rejected promise 를 반환한다.
    upsertMyCommentMock.mockRejectedValue(new Error("server down"));

    const client = makeClient();
    const queryKey = [
      "my-comment",
      "by-makgeolli",
      USER_ID,
      MAKGEOLLI_ID,
    ] as const;
    const previousComment = {
      id: "rollback-id",
      user_id: USER_ID,
      makgeolli_id: MAKGEOLLI_ID,
      comment: "롤백 대상 이전 코멘트",
      is_public: true,
      created_at: "2025-02-01T00:00:00Z",
      updated_at: "2025-02-02T00:00:00Z",
    };
    client.setQueryData(queryKey, previousComment);

    // setQueryData 호출 시퀀스를 캡쳐 — 낙관 갱신과 롤백 두 호출이 모두 발생했는지 검증.
    const setSpy = vi.spyOn(client, "setQueryData");

    const { result } = renderHook(() => useSaveMyComment(MAKGEOLLI_ID), {
      wrapper: wrap(client),
    });

    await act(async () => {
      await expect(
        result.current.save({ comment: "실패할 변경", isPublic: false }),
      ).rejects.toThrow(/server down/);
    });

    // 흐름 검증:
    //   (1) onMutate 가 낙관값으로 cache 를 한 번 setQueryData 했어야 한다.
    //   (2) onError 가 ctx.previous (= previousComment) 로 다시 setQueryData 했어야 한다.
    // 단순히 최종 cache 값만 보면 onMutate/onError 둘 다 없을 때도 통과해버리므로
    // setQueryData 호출 인자 시퀀스를 직접 검증한다.
    const callsForOurKey = setSpy.mock.calls.filter(
      ([k]) =>
        Array.isArray(k) &&
        k[0] === "my-comment" &&
        k[1] === "by-makgeolli" &&
        k[2] === USER_ID &&
        k[3] === MAKGEOLLI_ID,
    );
    // 최소 2회: 낙관 갱신 + 롤백.
    expect(callsForOurKey.length).toBeGreaterThanOrEqual(2);

    // 마지막 호출은 previousComment 로 복원.
    const lastCallValue = callsForOurKey[callsForOurKey.length - 1]?.[1];
    expect(lastCallValue).toEqual(previousComment);

    // 최종 cache 도 previousComment 로 복원되어 있어야 한다.
    await waitFor(() => {
      expect(client.getQueryData(queryKey)).toEqual(previousComment);
    });
  });
});
