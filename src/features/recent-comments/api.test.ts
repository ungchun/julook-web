import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchAllPublicComments } from "./api";

// supabase 단일 지점 모킹.
const fromMock = vi.fn();

vi.mock("@/shared/lib/supabase", () => ({
  supabase: {
    from: (table: string) => fromMock(table),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

function setupCommentsChain(commentsResp: { data: unknown; error: unknown }) {
  const orderMock = vi.fn().mockResolvedValue(commentsResp);
  const eqMock = vi.fn().mockReturnValue({ order: orderMock });
  const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
  return { orderMock, eqMock, selectMock };
}

function setupMakgeolliChain(resp: { data: unknown; error: unknown }) {
  const inMock = vi.fn().mockResolvedValue(resp);
  const selectMock = vi.fn().mockReturnValue({ in: inMock });
  return { inMock, selectMock };
}

describe("fetchAllPublicComments", () => {
  it("queries user_comments without limit, with is_public=true + created_at desc", async () => {
    const comments = setupCommentsChain({ data: [], error: null });
    fromMock.mockImplementation((table: string) => {
      if (table === "user_comments") return { select: comments.selectMock };
      return {};
    });

    await fetchAllPublicComments();

    expect(fromMock).toHaveBeenCalledWith("user_comments");
    expect(comments.selectMock).toHaveBeenCalledWith("*");
    expect(comments.eqMock).toHaveBeenCalledWith("is_public", true);
    expect(comments.orderMock).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
    // limit() 호출 없어야 함 — chain 의 마지막은 order
  });

  it("joins makgeolli rows by id and returns RecentCommentItem[]", async () => {
    const commentsRows = [
      {
        id: "c_1",
        user_id: "u_1",
        makgeolli_id: "m_1",
        comment: "맛있어요",
        is_public: true,
        created_at: "2025-04-01T00:00:00Z",
        updated_at: "2025-04-01T00:00:00Z",
      },
      {
        id: "c_2",
        user_id: "u_2",
        makgeolli_id: "m_2",
        comment: "탄산 좋아요",
        is_public: true,
        created_at: "2025-03-31T00:00:00Z",
        updated_at: "2025-03-31T00:00:00Z",
      },
    ];
    const makgeolliRows = [
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
        name: "지평막걸리",
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
    ];

    const comments = setupCommentsChain({ data: commentsRows, error: null });
    const makgeolli = setupMakgeolliChain({ data: makgeolliRows, error: null });
    fromMock.mockImplementation((table: string) => {
      if (table === "user_comments") return { select: comments.selectMock };
      if (table === "makgeolli") return { select: makgeolli.selectMock };
      return {};
    });

    const result = await fetchAllPublicComments();

    expect(makgeolli.inMock).toHaveBeenCalledWith("id", ["m_1", "m_2"]);
    expect(result).toHaveLength(2);
    expect(result[0].comment.id).toBe("c_1");
    expect(result[0].makgeolli.name).toBe("느린마을");
    expect(result[1].comment.id).toBe("c_2");
    expect(result[1].makgeolli.name).toBe("지평막걸리");
  });

  it("returns [] when comments are empty", async () => {
    const comments = setupCommentsChain({ data: [], error: null });
    fromMock.mockImplementation((table: string) => {
      if (table === "user_comments") return { select: comments.selectMock };
      return {};
    });

    const result = await fetchAllPublicComments();
    expect(result).toEqual([]);
  });

  it("throws when supabase returns error", async () => {
    const comments = setupCommentsChain({
      data: null,
      error: new Error("supabase failure"),
    });
    fromMock.mockImplementation((table: string) => {
      if (table === "user_comments") return { select: comments.selectMock };
      return {};
    });

    await expect(fetchAllPublicComments()).rejects.toThrow("supabase failure");
  });
});
