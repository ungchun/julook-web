import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useFavorites } from "./use-favorites";

const loadFavoritesMock = vi.fn();
const saveFavoritesMock = vi.fn();

vi.mock("@/shared/lib/favorites-storage", () => ({
  loadFavorites: () => loadFavoritesMock(),
  saveFavorites: (ids: string[]) => saveFavoritesMock(ids),
}));

function wrap() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  saveFavoritesMock.mockResolvedValue(undefined);
});

describe("useFavorites", () => {
  it("초기 마운트 시 loadFavorites 를 호출하고 결과를 반영한다", async () => {
    loadFavoritesMock.mockResolvedValueOnce(["m_1", "m_2"]);
    const { result } = renderHook(() => useFavorites(), { wrapper: wrap() });

    await waitFor(() => {
      expect(result.current.isFavorite("m_1")).toBe(true);
    });
    expect(result.current.isFavorite("m_2")).toBe(true);
    expect(result.current.isFavorite("m_3")).toBe(false);
  });

  it("toggle — 비찜 상태에서 호출 시 추가하고 save 호출", async () => {
    loadFavoritesMock.mockResolvedValue([]);
    const { result } = renderHook(() => useFavorites(), { wrapper: wrap() });

    await waitFor(() => {
      expect(result.current.isFavorite("m_x")).toBe(false);
    });

    await act(async () => {
      await result.current.toggle("m_x");
    });

    expect(saveFavoritesMock).toHaveBeenCalledWith(["m_x"]);
    expect(result.current.isFavorite("m_x")).toBe(true);
  });

  it("toggle — 찜 상태에서 호출 시 제거하고 save 호출", async () => {
    loadFavoritesMock.mockResolvedValue(["m_a", "m_b"]);
    const { result } = renderHook(() => useFavorites(), { wrapper: wrap() });

    await waitFor(() => {
      expect(result.current.isFavorite("m_a")).toBe(true);
    });

    await act(async () => {
      await result.current.toggle("m_a");
    });

    expect(saveFavoritesMock).toHaveBeenCalledWith(["m_b"]);
    await waitFor(() => {
      expect(result.current.isFavorite("m_a")).toBe(false);
    });
    expect(result.current.isFavorite("m_b")).toBe(true);
  });

  it("favorites 는 현재 찜한 id 배열을 반환한다", async () => {
    loadFavoritesMock.mockResolvedValueOnce(["m_1", "m_2", "m_3"]);
    const { result } = renderHook(() => useFavorites(), { wrapper: wrap() });

    await waitFor(() => {
      expect(result.current.favorites).toEqual(["m_1", "m_2", "m_3"]);
    });
  });

  // Phase 1 RED — iOS InformationCore+Effects.swift:45-57 의 favoriteStatusChanged
  // → refreshMyMakgeollis 1:1 미러. toggle 성공 시 ["my-activity"] prefix 1회 무효화.
  // 현재 use-favorites.ts:33-35 onSuccess 는 setQueryData 만 호출 → 본 테스트 실패.
  it("toggle 성공 시 ['my-activity'] prefix 도 무효화한다 (iOS refreshMyMakgeollis 미러)", async () => {
    loadFavoritesMock.mockResolvedValue([]);

    // 외부에서 동일 QueryClient 를 주입해 invalidateQueries 스파이를 건다.
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    function Provider({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
    }

    const { result } = renderHook(() => useFavorites(), { wrapper: Provider });

    await waitFor(() => {
      expect(result.current.isFavorite("m_x")).toBe(false);
    });

    invalidateSpy.mockClear();

    await act(async () => {
      await result.current.toggle("m_x");
    });

    const calledPrefixes = invalidateSpy.mock.calls.map((call) => {
      const arg = call[0] as { queryKey?: readonly unknown[] } | undefined;
      return arg?.queryKey?.[0];
    });

    expect(calledPrefixes).toContain("my-activity");
  });
});
