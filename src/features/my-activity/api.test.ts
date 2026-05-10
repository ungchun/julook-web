import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchMyAllActivity } from "./api";

const fromMock = vi.fn();

vi.mock("@/shared/lib/supabase", () => ({
  supabase: {
    from: (table: string) => fromMock(table),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const USER_ID = "user-fixture-id";

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

function setupMakgeolliChain(resp: { data: unknown; error: unknown }) {
  const inMock = vi.fn().mockResolvedValue(resp);
  const selectMock = vi.fn().mockReturnValue({ in: inMock });
  return { inMock, selectMock };
}

describe("fetchMyAllActivity", () => {
  it("queries makgeolli_reactions + user_comments + makgeolli and joins by makgeolli_id", async () => {
    const reactions = setupReactionsChain({
      data: [
        { makgeolli_id: "m_1", updated_at: "2025-04-01T00:00:00Z" },
        { makgeolli_id: "m_2", updated_at: "2025-03-30T00:00:00Z" },
      ],
      error: null,
    });
    const comments = setupCommentsChain({
      data: [{ makgeolli_id: "m_3", updated_at: "2025-04-02T00:00:00Z" }],
      error: null,
    });
    const makgeolli = setupMakgeolliChain({
      data: [
        {
          id: "m_1",
          name: "느린마을",
          brewery: null,
          website: null,
          awards: null,
          sweetness: null,
          sourness: null,
          thickness: null,
          carbonation: null,
          has_sweetener: null,
          ingredients: null,
          alcohol_percentage: null,
          image_name: null,
          created_at: null,
          updated_at: null,
        },
        {
          id: "m_2",
          name: "지평",
          brewery: null,
          website: null,
          awards: null,
          sweetness: null,
          sourness: null,
          thickness: null,
          carbonation: null,
          has_sweetener: null,
          ingredients: null,
          alcohol_percentage: null,
          image_name: null,
          created_at: null,
          updated_at: null,
        },
        {
          id: "m_3",
          name: "장수",
          brewery: null,
          website: null,
          awards: null,
          sweetness: null,
          sourness: null,
          thickness: null,
          carbonation: null,
          has_sweetener: null,
          ingredients: null,
          alcohol_percentage: null,
          image_name: null,
          created_at: null,
          updated_at: null,
        },
      ],
      error: null,
    });
    fromMock.mockImplementation((table: string) => {
      if (table === "makgeolli_reactions")
        return { select: reactions.selectMock };
      if (table === "user_comments") return { select: comments.selectMock };
      if (table === "makgeolli") return { select: makgeolli.selectMock };
      return {};
    });

    const result = await fetchMyAllActivity(USER_ID);

    expect(reactions.selectMock).toHaveBeenCalledWith("makgeolli_id, updated_at");
    expect(reactions.eqUserMock).toHaveBeenCalledWith("user_id", USER_ID);
    expect(comments.selectMock).toHaveBeenCalledWith("makgeolli_id, updated_at");
    expect(comments.eqUserMock).toHaveBeenCalledWith("user_id", USER_ID);
    expect(makgeolli.selectMock).toHaveBeenCalledWith("*");
    expect(makgeolli.inMock).toHaveBeenCalledWith(
      "id",
      expect.arrayContaining(["m_1", "m_2", "m_3"]),
    );

    expect(result).toHaveLength(3);
    // 정렬: lastActivityAt desc → m_3(04-02) > m_1(04-01) > m_2(03-30)
    expect(result[0].makgeolli.id).toBe("m_3");
    expect(result[1].makgeolli.id).toBe("m_1");
    expect(result[2].makgeolli.id).toBe("m_2");
  });

  it("returns [] when both reactions and comments are empty", async () => {
    const reactions = setupReactionsChain({ data: [], error: null });
    const comments = setupCommentsChain({ data: [], error: null });
    fromMock.mockImplementation((table: string) => {
      if (table === "makgeolli_reactions")
        return { select: reactions.selectMock };
      if (table === "user_comments") return { select: comments.selectMock };
      return {};
    });

    const result = await fetchMyAllActivity(USER_ID);
    expect(result).toEqual([]);
  });

  it("dedupes by makgeolli_id and uses latest activity time across reaction/comment", async () => {
    // m_1 에 reaction(03-30) + comment(04-05) — comment 가 더 최신
    const reactions = setupReactionsChain({
      data: [{ makgeolli_id: "m_1", updated_at: "2025-03-30T00:00:00Z" }],
      error: null,
    });
    const comments = setupCommentsChain({
      data: [{ makgeolli_id: "m_1", updated_at: "2025-04-05T00:00:00Z" }],
      error: null,
    });
    const makgeolli = setupMakgeolliChain({
      data: [
        {
          id: "m_1",
          name: "느린마을",
          brewery: null,
          website: null,
          awards: null,
          sweetness: null,
          sourness: null,
          thickness: null,
          carbonation: null,
          has_sweetener: null,
          ingredients: null,
          alcohol_percentage: null,
          image_name: null,
          created_at: null,
          updated_at: null,
        },
      ],
      error: null,
    });
    fromMock.mockImplementation((table: string) => {
      if (table === "makgeolli_reactions")
        return { select: reactions.selectMock };
      if (table === "user_comments") return { select: comments.selectMock };
      if (table === "makgeolli") return { select: makgeolli.selectMock };
      return {};
    });

    const result = await fetchMyAllActivity(USER_ID);
    expect(result).toHaveLength(1);
    expect(result[0].makgeolli.id).toBe("m_1");
    expect(result[0].lastActivityAt).toBe("2025-04-05T00:00:00Z");
  });
});
