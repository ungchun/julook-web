import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { useMyComment } from "../use-my-comment";

const fetchMyCommentMock = vi.fn();
const useUserIdMock = vi.fn();

vi.mock("@/shared/lib/user-comments", () => ({
  fetchMyComment: (...args: unknown[]) => fetchMyCommentMock(...args),
  upsertMyComment: vi.fn(),
  deleteMyComment: vi.fn(),
}));

vi.mock("@/shared/lib/use-user-id", () => ({
  useUserId: () => useUserIdMock(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
}

const USER_ID = "user-fixture-id";
const MAKGEOLLI_ID = "makgeolli-fixture-id";

describe("useMyComment", () => {
  it("when userId is not loaded, query is disabled and fetchMyComment is not called", async () => {
    useUserIdMock.mockReturnValue(undefined);

    const { result } = renderHook(() => useMyComment(MAKGEOLLI_ID), {
      wrapper: makeWrapper(),
    });

    // enabled === false 이므로 fetch 호출 없음
    expect(result.current.isFetching).toBe(false);
    expect(fetchMyCommentMock).not.toHaveBeenCalled();
  });

  it("when makgeolliId is undefined, query is disabled", async () => {
    useUserIdMock.mockReturnValue(USER_ID);

    const { result } = renderHook(() => useMyComment(undefined), {
      wrapper: makeWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(fetchMyCommentMock).not.toHaveBeenCalled();
  });

  it("when both userId and makgeolliId are ready, fetches and returns the row", async () => {
    useUserIdMock.mockReturnValue(USER_ID);
    const row = {
      id: "c1",
      user_id: USER_ID,
      makgeolli_id: MAKGEOLLI_ID,
      comment: "맛있어요",
      is_public: true,
      created_at: "2025-04-01T00:00:00Z",
      updated_at: "2025-04-01T00:00:00Z",
    };
    fetchMyCommentMock.mockResolvedValue(row);

    const { result } = renderHook(() => useMyComment(MAKGEOLLI_ID), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(row);
    });
    expect(fetchMyCommentMock).toHaveBeenCalledWith(USER_ID, MAKGEOLLI_ID);
  });

  it("returns null when there is no comment for this user/makgeolli pair", async () => {
    useUserIdMock.mockReturnValue(USER_ID);
    fetchMyCommentMock.mockResolvedValue(null);

    const { result } = renderHook(() => useMyComment(MAKGEOLLI_ID), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toBeNull();
  });

  it("when userId is not loaded yet, isLoading is true (to prevent empty-CTA flicker in MyCommentSection)", async () => {
    useUserIdMock.mockReturnValue(undefined);

    const { result } = renderHook(() => useMyComment(MAKGEOLLI_ID), {
      wrapper: makeWrapper(),
    });

    // 호출부(MyCommentSection)가 isLoading 만 보고 LoadingState 를 띄울 수 있도록,
    // userId 미준비 단계도 isLoading/isPending = true 로 통합한다 (Phase 0 옵션 1).
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isPending).toBe(true);
    // 단, fetch 자체는 아직 호출되어선 안 됨 (enabled 가드 유지).
    expect(fetchMyCommentMock).not.toHaveBeenCalled();
  });

  it("when makgeolliId is undefined, isLoading is true (same reason)", async () => {
    useUserIdMock.mockReturnValue(USER_ID);

    const { result } = renderHook(() => useMyComment(undefined), {
      wrapper: makeWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isPending).toBe(true);
    expect(fetchMyCommentMock).not.toHaveBeenCalled();
  });
});
