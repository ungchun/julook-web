import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useMyActivityDecorations } from "./use-my-activity-decorations";

// Phase 0 §"useMyActivityDecorations" 의 RED 테스트.
// Supabase 2개 query(makgeolli_reactions, user_comments) + useFavorites 결과를
// Map/Set 으로 합성하는 통합 hook.
//
// mock 전략:
//   - @/shared/lib/supabase : from(...).select(...).eq(...) chain
//   - @/shared/lib/use-user-id : 즉시 userId 반환
//   - @/features/favorites : useFavorites().favorites 반환

const FIXED_USER_ID = "user-fixture-id";

const useUserIdMock = vi.fn();
vi.mock("@/shared/lib/use-user-id", () => ({
  useUserId: () => useUserIdMock(),
}));

const fromMock = vi.fn();
vi.mock("@/shared/lib/supabase", () => ({
  supabase: {
    from: (table: string) => fromMock(table),
  },
}));

const useFavoritesMock = vi.fn();
vi.mock("@/features/favorites", () => ({
  useFavorites: () => useFavoritesMock(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  useUserIdMock.mockReturnValue(FIXED_USER_ID);
  useFavoritesMock.mockReturnValue({ favorites: [] });
});

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

function setupReactionsChain(resp: { data: unknown; error: unknown }) {
  const eqUserMock = vi.fn().mockResolvedValue(resp);
  const selectMock = vi.fn().mockReturnValue({ eq: eqUserMock });
  return { eqUserMock, selectMock };
}

function setupCommentsChain(resp: { data: unknown; error: unknown }) {
  const eqUserMock = vi.fn().mockResolvedValue(resp);
  const selectMock = vi.fn().mockReturnValue({ eq: eqUserMock });
  return { eqUserMock, selectMock };
}

describe("useMyActivityDecorations", () => {
  it("loads reactions/comments/favorites in parallel and exposes Map/Set lookups", async () => {
    const reactions = setupReactionsChain({
      data: [
        { makgeolli_id: "m_1", reaction_type: "like" },
        { makgeolli_id: "m_2", reaction_type: "dislike" },
      ],
      error: null,
    });
    const comments = setupCommentsChain({
      data: [{ makgeolli_id: "m_1" }, { makgeolli_id: "m_3" }],
      error: null,
    });
    fromMock.mockImplementation((table: string) => {
      if (table === "makgeolli_reactions")
        return { select: reactions.selectMock };
      if (table === "user_comments") return { select: comments.selectMock };
      return {};
    });
    useFavoritesMock.mockReturnValue({ favorites: ["m_2", "m_4"] });

    const { result } = renderHook(() => useMyActivityDecorations(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    const data = result.current.data!;
    // reactions: Map<id, ReactionType>
    expect(data.reactionByMakgeolliId.get("m_1")).toBe("like");
    expect(data.reactionByMakgeolliId.get("m_2")).toBe("dislike");
    expect(data.reactionByMakgeolliId.get("m_3")).toBeUndefined();
    // comments: Set<id>
    expect(data.commentSet.has("m_1")).toBe(true);
    expect(data.commentSet.has("m_3")).toBe(true);
    expect(data.commentSet.has("m_2")).toBe(false);
    // favorites: Set<id> (useFavorites().favorites 위임)
    expect(data.favoriteSet.has("m_2")).toBe(true);
    expect(data.favoriteSet.has("m_4")).toBe(true);
    expect(data.favoriteSet.has("m_1")).toBe(false);

    expect(reactions.selectMock).toHaveBeenCalledWith(
      "makgeolli_id, reaction_type",
    );
    expect(reactions.eqUserMock).toHaveBeenCalledWith("user_id", FIXED_USER_ID);
    expect(comments.selectMock).toHaveBeenCalledWith("makgeolli_id");
    expect(comments.eqUserMock).toHaveBeenCalledWith("user_id", FIXED_USER_ID);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("returns empty Map/Set when user has no activity", async () => {
    const reactions = setupReactionsChain({ data: [], error: null });
    const comments = setupCommentsChain({ data: [], error: null });
    fromMock.mockImplementation((table: string) => {
      if (table === "makgeolli_reactions")
        return { select: reactions.selectMock };
      if (table === "user_comments") return { select: comments.selectMock };
      return {};
    });
    useFavoritesMock.mockReturnValue({ favorites: [] });

    const { result } = renderHook(() => useMyActivityDecorations(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    const data = result.current.data!;
    expect(data.reactionByMakgeolliId.size).toBe(0);
    expect(data.commentSet.size).toBe(0);
    expect(data.favoriteSet.size).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("isLoading is true while userId is undefined (no fetch yet)", async () => {
    useUserIdMock.mockReturnValue(undefined);
    fromMock.mockImplementation(() => {
      throw new Error("supabase.from should not be called before userId loads");
    });
    useFavoritesMock.mockReturnValue({ favorites: [] });

    const { result } = renderHook(() => useMyActivityDecorations(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.isError).toBe(false);
  });

  it("isError is true when reactions query fails", async () => {
    const reactions = setupReactionsChain({
      data: null,
      error: new Error("network reactions"),
    });
    const comments = setupCommentsChain({ data: [], error: null });
    fromMock.mockImplementation((table: string) => {
      if (table === "makgeolli_reactions")
        return { select: reactions.selectMock };
      if (table === "user_comments") return { select: comments.selectMock };
      return {};
    });
    useFavoritesMock.mockReturnValue({ favorites: [] });

    const { result } = renderHook(() => useMyActivityDecorations(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.data).toBeUndefined();
  });
});
