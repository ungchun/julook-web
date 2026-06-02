import { describe, it, expect, vi, beforeEach } from "vitest";
import { loadFavorites, saveFavorites } from "./favorites-storage";

const getItemMock = vi.fn();
const setItemMock = vi.fn();

vi.mock("@apps-in-toss/web-framework", () => ({
  Storage: {
    getItem: (k: string) => getItemMock(k),
    setItem: (k: string, v: string) => setItemMock(k, v),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("favorites-storage", () => {
  it("loadFavorites — 저장된 값이 없으면 빈 배열을 반환한다", async () => {
    getItemMock.mockResolvedValueOnce(null);
    expect(await loadFavorites()).toEqual([]);
    expect(getItemMock).toHaveBeenCalledWith("julook:favorites");
  });

  it("loadFavorites — JSON 배열로 저장된 값을 파싱한다", async () => {
    getItemMock.mockResolvedValueOnce('["m_1","m_2","m_3"]');
    expect(await loadFavorites()).toEqual(["m_1", "m_2", "m_3"]);
  });

  it("loadFavorites — 손상된 JSON 은 빈 배열로 안전하게 폴백한다", async () => {
    getItemMock.mockResolvedValueOnce("not-json");
    expect(await loadFavorites()).toEqual([]);
  });

  it("loadFavorites — 배열이지만 string 외 요소가 있으면 빈 배열", async () => {
    getItemMock.mockResolvedValueOnce('[1, "m_1"]');
    expect(await loadFavorites()).toEqual([]);
  });

  it("saveFavorites — 배열을 JSON 문자열로 저장한다", async () => {
    setItemMock.mockResolvedValueOnce(undefined);
    await saveFavorites(["m_1", "m_2"]);
    expect(setItemMock).toHaveBeenCalledWith(
      "julook:favorites",
      JSON.stringify(["m_1", "m_2"]),
    );
  });
});
