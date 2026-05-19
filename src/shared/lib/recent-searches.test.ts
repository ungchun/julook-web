import { beforeEach, describe, expect, it, vi } from "vitest";
import { Storage } from "@apps-in-toss/web-framework";

vi.mock("@apps-in-toss/web-framework", () => ({
  Storage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}));

describe("loadRecentSearches / saveRecentSearches", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("when Storage is empty, load returns an empty array", async () => {
    vi.mocked(Storage.getItem).mockResolvedValueOnce(null);
    const { loadRecentSearches } = await import("./recent-searches");

    const items = await loadRecentSearches();
    expect(items).toEqual([]);
    expect(Storage.getItem).toHaveBeenCalledWith("julook:recent-searches");
  });

  it("when Storage has a JSON array, load returns the parsed array", async () => {
    vi.mocked(Storage.getItem).mockResolvedValueOnce(
      JSON.stringify(["느린마을", "지평"]),
    );
    const { loadRecentSearches } = await import("./recent-searches");

    expect(await loadRecentSearches()).toEqual(["느린마을", "지평"]);
  });

  it("when stored value is malformed, load returns empty array (defensive)", async () => {
    vi.mocked(Storage.getItem).mockResolvedValueOnce("not-json{{");
    const { loadRecentSearches } = await import("./recent-searches");

    expect(await loadRecentSearches()).toEqual([]);
  });

  it("save serializes the array to JSON and persists under the key", async () => {
    vi.mocked(Storage.setItem).mockResolvedValueOnce(undefined);
    const { saveRecentSearches } = await import("./recent-searches");

    await saveRecentSearches(["abc", "def"]);
    expect(Storage.setItem).toHaveBeenCalledWith(
      "julook:recent-searches",
      JSON.stringify(["abc", "def"]),
    );
  });
});
