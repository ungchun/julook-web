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

  // ───────────────────────────────────────────────────────────────────────────
  // Phase 1 RED — queryKey 일원화 검증 (옵션 B).
  // 두 decoration 의 queryKey 가 ["my-activity", "decorations", ...] prefix 를
  // 따르도록 변경되어야 한다. 현재 키 ["my-activity-decorations", ...] → 본 테스트 실패.
  // 이 prefix 변경으로 invalidateCommentCaches 와 invalidateMyActivityCaches 의
  // ["my-activity"] prefix invalidate 가 decoration 까지 매칭된다.
  // ───────────────────────────────────────────────────────────────────────────
  describe("queryKey 일원화 (my-activity prefix)", () => {
    it("uses ['my-activity', 'decorations', 'reactions', userId] as reactions queryKey", async () => {
      const reactions = setupReactionsChain({ data: [], error: null });
      const comments = setupCommentsChain({ data: [], error: null });
      fromMock.mockImplementation((table: string) => {
        if (table === "makgeolli_reactions")
          return { select: reactions.selectMock };
        if (table === "user_comments") return { select: comments.selectMock };
        return {};
      });
      useFavoritesMock.mockReturnValue({ favorites: [] });

      // QueryClient 를 직접 주입해 cache 에서 queryKey 를 확인.
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      function Wrapper({ children }: { children: ReactNode }) {
        return (
          <QueryClientProvider client={client}>{children}</QueryClientProvider>
        );
      }

      const { result } = renderHook(() => useMyActivityDecorations(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      const reactionsQuery = client
        .getQueryCache()
        .find({
          queryKey: ["my-activity", "decorations", "reactions", FIXED_USER_ID],
        });
      expect(reactionsQuery).toBeDefined();
    });

    it("uses ['my-activity', 'decorations', 'comments', userId] as comments queryKey", async () => {
      const reactions = setupReactionsChain({ data: [], error: null });
      const comments = setupCommentsChain({ data: [], error: null });
      fromMock.mockImplementation((table: string) => {
        if (table === "makgeolli_reactions")
          return { select: reactions.selectMock };
        if (table === "user_comments") return { select: comments.selectMock };
        return {};
      });
      useFavoritesMock.mockReturnValue({ favorites: [] });

      const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      function Wrapper({ children }: { children: ReactNode }) {
        return (
          <QueryClientProvider client={client}>{children}</QueryClientProvider>
        );
      }

      const { result } = renderHook(() => useMyActivityDecorations(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      const commentsQuery = client
        .getQueryCache()
        .find({
          queryKey: ["my-activity", "decorations", "comments", FIXED_USER_ID],
        });
      expect(commentsQuery).toBeDefined();
    });

    // NOTE: "decoration query 가 ['my-activity'] prefix invalidate 로 무효화된다"는
    // 통합 케이스는 의도가 두 갈래로 분해되어 다른 곳에서 더 안정적으로 검증된다:
    //   (a) decoration queryKey 가 ['my-activity', 'decorations', ...] prefix 를 갖는다
    //       → 위 두 케이스 (lines 191, 228) 에서 직접 검증.
    //   (b) ['my-activity'] 1회 invalidate 가 prefix matching 으로 더 긴 queryKey 까지
    //       stale 처리한다 → src/features/my-activity/lib/invalidate-my-activity-caches.test.ts
    //       의 "invalidation matches decoration queryKeys via prefix matching" 에서 검증.
    //   (c) reaction mutation 성공 시 ['my-activity'] invalidate 가 호출된다
    //       → src/features/reaction/use-reaction.test.tsx 에서 검증.
    //
    // 여기서 동일한 통합 케이스를 renderHook + 실제 active query 로 재현하려 하면
    // React Query v5 의 active query auto-refetch 때문에 invalidate 직후 fetch 가
    // 시작되고 성공하면 isInvalidated 가 즉시 false 로 리셋되어 비결정적이 된다.
    // (a)+(b)+(c) 조합으로 동일 의도가 이미 deterministic 하게 커버되므로 통합
    // 케이스는 의도적으로 생략한다.
  });
});
