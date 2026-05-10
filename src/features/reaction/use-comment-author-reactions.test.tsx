import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useCommentAuthorReactions } from "./use-comment-author-reactions";

const fetchUserReactionMock = vi.fn();

vi.mock("./api", () => ({
  fetchUserReaction: (...args: unknown[]) => fetchUserReactionMock(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

const COMMENTS = [
  { id: "c_1", user_id: "u_1", makgeolli_id: "m_1" },
  { id: "c_2", user_id: "u_2", makgeolli_id: "m_2" },
  { id: "c_3", user_id: "u_3", makgeolli_id: "m_3" },
];

describe("useCommentAuthorReactions", () => {
  it("when comments is empty, query is disabled and supabase is not called", async () => {
    const { result } = renderHook(() => useCommentAuthorReactions([]), {
      wrapper: makeWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(fetchUserReactionMock).not.toHaveBeenCalled();
  });

  it("when comments is undefined, query is disabled", async () => {
    const { result } = renderHook(
      () => useCommentAuthorReactions(undefined),
      { wrapper: makeWrapper() },
    );

    expect(result.current.isFetching).toBe(false);
    expect(fetchUserReactionMock).not.toHaveBeenCalled();
  });

  it("returns map with reaction type by comment id", async () => {
    fetchUserReactionMock.mockImplementation(async (userId: string) => {
      if (userId === "u_1") return "like";
      if (userId === "u_2") return "dislike";
      return null;
    });

    const { result } = renderHook(() => useCommentAuthorReactions(COMMENTS), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    const map = result.current.data!;
    expect(map.get("c_1")).toBe("like");
    expect(map.get("c_2")).toBe("dislike");
    expect(map.get("c_3")).toBe(null);
    expect(fetchUserReactionMock).toHaveBeenCalledTimes(3);
    expect(fetchUserReactionMock).toHaveBeenCalledWith("u_1", "m_1");
    expect(fetchUserReactionMock).toHaveBeenCalledWith("u_2", "m_2");
    expect(fetchUserReactionMock).toHaveBeenCalledWith("u_3", "m_3");
  });

  it("when fetchUserReaction throws for one comment, returns null for that comment and continues", async () => {
    fetchUserReactionMock.mockImplementation(async (userId: string) => {
      if (userId === "u_2") throw new Error("network");
      return "like";
    });

    const { result } = renderHook(() => useCommentAuthorReactions(COMMENTS), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    const map = result.current.data!;
    expect(map.get("c_1")).toBe("like");
    expect(map.get("c_2")).toBe(null);
    expect(map.get("c_3")).toBe("like");
  });
});
