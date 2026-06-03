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
});
