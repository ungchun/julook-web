import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

vi.mock("@/shared/lib/recent-searches", () => ({
  loadRecentSearches: vi.fn(),
  saveRecentSearches: vi.fn(),
}));

describe("useRecentSearches", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("on mount, loads items from storage", async () => {
    const { loadRecentSearches, saveRecentSearches } = await import(
      "@/shared/lib/recent-searches"
    );
    vi.mocked(loadRecentSearches).mockResolvedValueOnce(["one", "two"]);
    vi.mocked(saveRecentSearches).mockResolvedValue(undefined);

    const { useRecentSearches } = await import("./use-recent-searches");
    const { result } = renderHook(() => useRecentSearches());

    await waitFor(() => {
      expect(result.current.items).toEqual(["one", "two"]);
    });
  });

  it("add(keyword) prepends and persists", async () => {
    const { loadRecentSearches, saveRecentSearches } = await import(
      "@/shared/lib/recent-searches"
    );
    vi.mocked(loadRecentSearches).mockResolvedValueOnce([]);
    vi.mocked(saveRecentSearches).mockResolvedValue(undefined);

    const { useRecentSearches } = await import("./use-recent-searches");
    const { result } = renderHook(() => useRecentSearches());

    await waitFor(() => expect(result.current.items).toEqual([]));

    await act(async () => {
      await result.current.add("느린마을");
    });

    expect(result.current.items).toEqual(["느린마을"]);
    expect(saveRecentSearches).toHaveBeenCalledWith(["느린마을"]);
  });

  it("add(keyword) deduplicates by moving existing entry to top", async () => {
    const { loadRecentSearches, saveRecentSearches } = await import(
      "@/shared/lib/recent-searches"
    );
    vi.mocked(loadRecentSearches).mockResolvedValueOnce(["a", "b", "c"]);
    vi.mocked(saveRecentSearches).mockResolvedValue(undefined);

    const { useRecentSearches } = await import("./use-recent-searches");
    const { result } = renderHook(() => useRecentSearches());

    await waitFor(() => expect(result.current.items).toEqual(["a", "b", "c"]));

    await act(async () => {
      await result.current.add("b");
    });

    expect(result.current.items).toEqual(["b", "a", "c"]);
  });

  it("add(keyword) limits items to 10", async () => {
    const { loadRecentSearches, saveRecentSearches } = await import(
      "@/shared/lib/recent-searches"
    );
    const initial = Array.from({ length: 10 }, (_, i) => `q${i}`);
    vi.mocked(loadRecentSearches).mockResolvedValueOnce(initial);
    vi.mocked(saveRecentSearches).mockResolvedValue(undefined);

    const { useRecentSearches } = await import("./use-recent-searches");
    const { result } = renderHook(() => useRecentSearches());

    await waitFor(() =>
      expect(result.current.items.length).toBe(10),
    );

    await act(async () => {
      await result.current.add("new");
    });

    expect(result.current.items.length).toBe(10);
    expect(result.current.items[0]).toBe("new");
    expect(result.current.items[9]).toBe("q8"); // q9 was dropped
  });

  it("add(empty or whitespace) is a no-op", async () => {
    const { loadRecentSearches, saveRecentSearches } = await import(
      "@/shared/lib/recent-searches"
    );
    vi.mocked(loadRecentSearches).mockResolvedValueOnce([]);
    vi.mocked(saveRecentSearches).mockResolvedValue(undefined);

    const { useRecentSearches } = await import("./use-recent-searches");
    const { result } = renderHook(() => useRecentSearches());

    await waitFor(() => expect(result.current.items).toEqual([]));

    await act(async () => {
      await result.current.add("   ");
    });

    expect(result.current.items).toEqual([]);
    expect(saveRecentSearches).not.toHaveBeenCalled();
  });

  it("removeAt removes an item by index and persists", async () => {
    const { loadRecentSearches, saveRecentSearches } = await import(
      "@/shared/lib/recent-searches"
    );
    vi.mocked(loadRecentSearches).mockResolvedValueOnce(["a", "b", "c"]);
    vi.mocked(saveRecentSearches).mockResolvedValue(undefined);

    const { useRecentSearches } = await import("./use-recent-searches");
    const { result } = renderHook(() => useRecentSearches());

    await waitFor(() => expect(result.current.items).toEqual(["a", "b", "c"]));

    await act(async () => {
      await result.current.removeAt(1);
    });

    expect(result.current.items).toEqual(["a", "c"]);
    expect(saveRecentSearches).toHaveBeenCalledWith(["a", "c"]);
  });

  it("clearAll empties the list and persists", async () => {
    const { loadRecentSearches, saveRecentSearches } = await import(
      "@/shared/lib/recent-searches"
    );
    vi.mocked(loadRecentSearches).mockResolvedValueOnce(["a", "b"]);
    vi.mocked(saveRecentSearches).mockResolvedValue(undefined);

    const { useRecentSearches } = await import("./use-recent-searches");
    const { result } = renderHook(() => useRecentSearches());

    await waitFor(() => expect(result.current.items).toEqual(["a", "b"]));

    await act(async () => {
      await result.current.clearAll();
    });

    expect(result.current.items).toEqual([]);
    expect(saveRecentSearches).toHaveBeenCalledWith([]);
  });
});
