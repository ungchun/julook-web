import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchDetailComments } from "./api";

// supabase 단일 지점 모킹 — chain order는 iOS getPublicComments(SupabaseClientLive+Comment.swift:78) 미러
const orderMock = vi.fn();
const eqIsPublicMock = vi.fn();
const eqMakgeolliIdMock = vi.fn();
const selectMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@/shared/lib/supabase", () => ({
  supabase: {
    from: (table: string) => fromMock(table),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  fromMock.mockReturnValue({ select: selectMock });
  selectMock.mockReturnValue({ eq: eqMakgeolliIdMock });
  eqMakgeolliIdMock.mockReturnValue({ eq: eqIsPublicMock });
  eqIsPublicMock.mockReturnValue({ order: orderMock });
});

const MAKGEOLLI_ID = "makgeolli-fixture-id";

describe("fetchDetailComments", () => {
  it("queries user_comments with makgeolli_id + is_public + created_at desc", async () => {
    orderMock.mockResolvedValue({ data: [], error: null });

    await fetchDetailComments(MAKGEOLLI_ID);

    expect(fromMock).toHaveBeenCalledWith("user_comments");
    expect(selectMock).toHaveBeenCalledWith("*");
    expect(eqMakgeolliIdMock).toHaveBeenCalledWith("makgeolli_id", MAKGEOLLI_ID);
    expect(eqIsPublicMock).toHaveBeenCalledWith("is_public", true);
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("returns the rows array as-is when supabase responds with data", async () => {
    const rows = [
      {
        id: "c1",
        user_id: "u1",
        makgeolli_id: MAKGEOLLI_ID,
        comment: "맛있어요",
        is_public: true,
        created_at: "2025-04-01T00:00:00Z",
        updated_at: "2025-04-01T00:00:00Z",
      },
    ];
    orderMock.mockResolvedValue({ data: rows, error: null });

    const result = await fetchDetailComments(MAKGEOLLI_ID);

    expect(result).toEqual(rows);
  });

  it("returns [] when supabase data is null", async () => {
    orderMock.mockResolvedValue({ data: null, error: null });

    const result = await fetchDetailComments(MAKGEOLLI_ID);

    expect(result).toEqual([]);
  });

  it("throws when supabase returns an error", async () => {
    orderMock.mockResolvedValue({
      data: null,
      error: new Error("supabase failure"),
    });

    await expect(fetchDetailComments(MAKGEOLLI_ID)).rejects.toThrow(
      "supabase failure",
    );
  });
});
