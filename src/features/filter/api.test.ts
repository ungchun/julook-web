import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchMakgeollisByFilter,
  fetchMakgeollisByFilters,
  fetchMakgeollisByFiltersPage,
} from "./api";

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

describe("fetchMakgeollisByFilters (multi-select)", () => {
  it("0 slugs → predicate 호출 없이 전체 fetch", async () => {
    // 0 slugs인 경우 select 다음 바로 order 체이닝
    selectMock.mockReturnValue({ order: orderIdMock });
    orderCreatedAtMock.mockResolvedValue({ data: [], error: null });

    await fetchMakgeollisByFilters([]);

    expect(fromMock).toHaveBeenCalledWith("makgeolli");
    expect(selectMock).toHaveBeenCalledWith("*");
    expect(predicateMock).not.toHaveBeenCalled();
    expect(orderIdMock).toHaveBeenCalledWith("id", { ascending: true });
    expect(orderCreatedAtMock).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
  });

  it("2 slugs (sweet + sour) → 각각 gte('sweetness', 3) + gte('sourness', 3) 적용 (AND)", async () => {
    // predicate가 두 번 호출됨. 두 번째 호출도 다음 predicate 체이닝 + 최종 order
    predicateMock
      .mockReturnValueOnce({ gte: predicateMock, eq: predicateMock })
      .mockReturnValueOnce({ order: orderIdMock });
    orderCreatedAtMock.mockResolvedValue({ data: [], error: null });

    await fetchMakgeollisByFilters(["sweet", "sour"]);

    expect(predicateMock).toHaveBeenNthCalledWith(1, "sweetness", 3);
    expect(predicateMock).toHaveBeenNthCalledWith(2, "sourness", 3);
  });

  it("no-sweetener 단일 → has_sweetener eq false", async () => {
    orderCreatedAtMock.mockResolvedValue({ data: [], error: null });

    await fetchMakgeollisByFilters(["no-sweetener"]);

    expect(predicateMock).toHaveBeenCalledWith("has_sweetener", false);
  });
});

describe("fetchMakgeollisByFiltersPage (서버 페이지네이션)", () => {
  it("offset 0, pageSize 10 → range(0, 9)", async () => {
    const rangeMock = vi.fn().mockResolvedValue({ data: [], error: null });
    selectMock.mockReturnValue({ order: orderIdMock });
    orderIdMock.mockReturnValue({ order: orderCreatedAtMock });
    orderCreatedAtMock.mockReturnValue({ range: rangeMock });

    await fetchMakgeollisByFiltersPage([], 10, 0);

    expect(rangeMock).toHaveBeenCalledWith(0, 9);
  });

  it("offset 20, pageSize 10 → range(20, 29)", async () => {
    const rangeMock = vi.fn().mockResolvedValue({ data: [], error: null });
    selectMock.mockReturnValue({ order: orderIdMock });
    orderIdMock.mockReturnValue({ order: orderCreatedAtMock });
    orderCreatedAtMock.mockReturnValue({ range: rangeMock });

    await fetchMakgeollisByFiltersPage([], 10, 20);

    expect(rangeMock).toHaveBeenCalledWith(20, 29);
  });

  it("filters 2개 적용 후 range 호출 (predicate 2 → order → order → range)", async () => {
    const rangeMock = vi.fn().mockResolvedValue({ data: [], error: null });
    predicateMock
      .mockReturnValueOnce({ gte: predicateMock, eq: predicateMock })
      .mockReturnValueOnce({ order: orderIdMock });
    orderIdMock.mockReturnValue({ order: orderCreatedAtMock });
    orderCreatedAtMock.mockReturnValue({ range: rangeMock });

    await fetchMakgeollisByFiltersPage(["sweet", "sour"], 10, 0);

    expect(predicateMock).toHaveBeenNthCalledWith(1, "sweetness", 3);
    expect(predicateMock).toHaveBeenNthCalledWith(2, "sourness", 3);
    expect(rangeMock).toHaveBeenCalledWith(0, 9);
  });
});
