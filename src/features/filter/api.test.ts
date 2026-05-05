import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchMakgeollisByFilter } from "./api";

// supabase chain 모킹 — iOS fetchFilteredMakgeollis 미러:
// from("makgeolli").select("*").{gte|eq}(col, val).order("id", asc).order("created_at", desc)
const orderCreatedAtMock = vi.fn();
const orderIdMock = vi.fn();
const predicateMock = vi.fn();
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
  selectMock.mockReturnValue({ gte: predicateMock, eq: predicateMock });
  predicateMock.mockReturnValue({ order: orderIdMock });
  orderIdMock.mockReturnValue({ order: orderCreatedAtMock });
});

describe("fetchMakgeollisByFilter", () => {
  it("'thick' queries makgeolli with thickness gte 3 + id asc + created_at desc", async () => {
    orderCreatedAtMock.mockResolvedValue({ data: [], error: null });

    await fetchMakgeollisByFilter("thick");

    expect(fromMock).toHaveBeenCalledWith("makgeolli");
    expect(selectMock).toHaveBeenCalledWith("*");
    expect(predicateMock).toHaveBeenCalledWith("thickness", 3);
    expect(orderIdMock).toHaveBeenCalledWith("id", { ascending: true });
    expect(orderCreatedAtMock).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
  });

  it("'sweet' uses sweetness gte 3", async () => {
    orderCreatedAtMock.mockResolvedValue({ data: [], error: null });

    await fetchMakgeollisByFilter("sweet");

    expect(predicateMock).toHaveBeenCalledWith("sweetness", 3);
  });

  it("'no-sweetener' uses has_sweetener eq false", async () => {
    orderCreatedAtMock.mockResolvedValue({ data: [], error: null });

    await fetchMakgeollisByFilter("no-sweetener");

    expect(predicateMock).toHaveBeenCalledWith("has_sweetener", false);
  });

  it("returns rows array as-is when supabase responds with data", async () => {
    const rows = [
      {
        id: "id_1",
        name: "느린마을",
        brewery: null,
        website: null,
        awards: null,
        sweetness: null,
        sourness: null,
        thickness: 4,
        carbonation: null,
        has_sweetener: null,
        ingredients: null,
        alcohol_percentage: null,
        image_name: null,
        created_at: null,
        updated_at: null,
      },
    ];
    orderCreatedAtMock.mockResolvedValue({ data: rows, error: null });

    const result = await fetchMakgeollisByFilter("thick");
    expect(result).toEqual(rows);
  });

  it("returns [] when supabase data is null", async () => {
    orderCreatedAtMock.mockResolvedValue({ data: null, error: null });
    const result = await fetchMakgeollisByFilter("thick");
    expect(result).toEqual([]);
  });

  it("throws when supabase returns an error", async () => {
    orderCreatedAtMock.mockResolvedValue({
      data: null,
      error: new Error("supabase failure"),
    });
    await expect(fetchMakgeollisByFilter("thick")).rejects.toThrow(
      "supabase failure",
    );
  });
});
