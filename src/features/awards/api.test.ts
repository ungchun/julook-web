import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchAwardById,
  fetchMakgeollisByAwardName,
} from "./api";

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

describe("fetchAwardById", () => {
  it("queries awards by id and returns single row", async () => {
    const maybeSingleMock = vi.fn().mockResolvedValue({
      data: {
        id: "award-1",
        name: "2024 대한민국 주류대상",
        name_en: null,
        year: 2024,
        type: "korea_award",
      },
      error: null,
    });
    const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
    fromMock.mockReturnValue({ select: selectMock });

    const result = await fetchAwardById("award-1");

    expect(fromMock).toHaveBeenCalledWith("awards");
    expect(selectMock).toHaveBeenCalledWith("*");
    expect(eqMock).toHaveBeenCalledWith("id", "award-1");
    expect(maybeSingleMock).toHaveBeenCalled();
    expect(result?.name).toBe("2024 대한민국 주류대상");
  });

  it("returns null when not found", async () => {
    const maybeSingleMock = vi
      .fn()
      .mockResolvedValue({ data: null, error: null });
    const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
    fromMock.mockReturnValue({ select: selectMock });

    const result = await fetchAwardById("missing");
    expect(result).toBeNull();
  });

  it("throws when supabase returns error", async () => {
    const maybeSingleMock = vi.fn().mockResolvedValue({
      data: null,
      error: new Error("supabase failure"),
    });
    const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
    fromMock.mockReturnValue({ select: selectMock });

    await expect(fetchAwardById("award-1")).rejects.toThrow("supabase failure");
  });
});

describe("fetchMakgeollisByAwardName", () => {
  it("uses contains('awards', [name]) + id asc + created_at desc", async () => {
    const orderCreatedAtMock = vi
      .fn()
      .mockResolvedValue({ data: [], error: null });
    const orderIdMock = vi.fn().mockReturnValue({ order: orderCreatedAtMock });
    const containsMock = vi.fn().mockReturnValue({ order: orderIdMock });
    const selectMock = vi.fn().mockReturnValue({ contains: containsMock });
    fromMock.mockReturnValue({ select: selectMock });

    await fetchMakgeollisByAwardName("2024 대한민국 주류대상");

    expect(fromMock).toHaveBeenCalledWith("makgeolli");
    expect(selectMock).toHaveBeenCalledWith("*");
    expect(containsMock).toHaveBeenCalledWith("awards", [
      "2024 대한민국 주류대상",
    ]);
    expect(orderIdMock).toHaveBeenCalledWith("id", { ascending: true });
    expect(orderCreatedAtMock).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
  });

  it("returns rows when supabase responds with data", async () => {
    const rows = [
      {
        id: "m_1",
        name: "느린마을",
        brewery: null,
        website: null,
        awards: ["2024 대한민국 주류대상"],
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
    const orderCreatedAtMock = vi
      .fn()
      .mockResolvedValue({ data: rows, error: null });
    const orderIdMock = vi.fn().mockReturnValue({ order: orderCreatedAtMock });
    const containsMock = vi.fn().mockReturnValue({ order: orderIdMock });
    const selectMock = vi.fn().mockReturnValue({ contains: containsMock });
    fromMock.mockReturnValue({ select: selectMock });

    const result = await fetchMakgeollisByAwardName("2024 대한민국 주류대상");
    expect(result).toEqual(rows);
  });

  it("returns [] when supabase data is null", async () => {
    const orderCreatedAtMock = vi
      .fn()
      .mockResolvedValue({ data: null, error: null });
    const orderIdMock = vi.fn().mockReturnValue({ order: orderCreatedAtMock });
    const containsMock = vi.fn().mockReturnValue({ order: orderIdMock });
    const selectMock = vi.fn().mockReturnValue({ contains: containsMock });
    fromMock.mockReturnValue({ select: selectMock });

    const result = await fetchMakgeollisByAwardName("any");
    expect(result).toEqual([]);
  });

  it("throws on supabase error", async () => {
    const orderCreatedAtMock = vi.fn().mockResolvedValue({
      data: null,
      error: new Error("supabase failure"),
    });
    const orderIdMock = vi.fn().mockReturnValue({ order: orderCreatedAtMock });
    const containsMock = vi.fn().mockReturnValue({ order: orderIdMock });
    const selectMock = vi.fn().mockReturnValue({ contains: containsMock });
    fromMock.mockReturnValue({ select: selectMock });

    await expect(fetchMakgeollisByAwardName("any")).rejects.toThrow(
      "supabase failure",
    );
  });
});
