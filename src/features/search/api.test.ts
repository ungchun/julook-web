import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchMakgeollis } from "./api";

const rpcMock = vi.fn();

vi.mock("@/shared/lib/supabase", () => ({
  supabase: {
    rpc: (name: string, params: Record<string, unknown>) =>
      rpcMock(name, params),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("searchMakgeollis", () => {
  it("calls rpc 'search_makgeolli_flexible' with search_query param", async () => {
    rpcMock.mockResolvedValue({ data: [], error: null });

    await searchMakgeollis("느린마을");

    expect(rpcMock).toHaveBeenCalledWith("search_makgeolli_flexible", {
      search_query: "느린마을",
    });
  });

  it("returns empty array when rpc data is null", async () => {
    rpcMock.mockResolvedValue({ data: null, error: null });
    const result = await searchMakgeollis("any");
    expect(result).toEqual([]);
  });

  it("returns rows as-is when rpc responds with data", async () => {
    const rows = [
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
    ];
    rpcMock.mockResolvedValue({ data: rows, error: null });
    const result = await searchMakgeollis("느린마을");
    expect(result).toEqual(rows);
  });

  it("throws when rpc returns an error", async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: new Error("rpc failure"),
    });
    await expect(searchMakgeollis("x")).rejects.toThrow("rpc failure");
  });
});
