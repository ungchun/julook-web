import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useFavoriteMakgeollis } from "./use-favorite-makgeollis";

const inMock = vi.fn();
const selectMock = vi.fn();
const fromMock = vi.fn();
const getPublicUrlMock = vi
  .fn()
  .mockReturnValue({ data: { publicUrl: "https://t.test/x.png" } });

vi.mock("@/shared/lib/supabase", () => ({
  supabase: {
    from: (t: string) => fromMock(t),
    storage: { from: () => ({ getPublicUrl: getPublicUrlMock }) },
  },
}));

const useFavoritesRef: { current: { favorites: string[] } } = {
  current: { favorites: [] },
};

vi.mock("./use-favorites", () => ({
  useFavorites: () => useFavoritesRef.current,
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
  inMock.mockResolvedValue({ data: [], error: null });
  selectMock.mockReturnValue({ in: inMock });
  fromMock.mockReturnValue({ select: selectMock });
});

describe("useFavoriteMakgeollis", () => {
  it("favorites 비어있으면 supabase fetch 자체를 호출하지 않는다", async () => {
    useFavoritesRef.current = { favorites: [] };
    renderHook(() => useFavoriteMakgeollis(), { wrapper: wrap() });

    await waitFor(() => {
      expect(fromMock).not.toHaveBeenCalled();
    });
  });

  it("favorites id 배열로 makgeolli 테이블 in 조회", async () => {
    useFavoritesRef.current = { favorites: ["m_1", "m_2"] };
    inMock.mockResolvedValueOnce({
      data: [
        { id: "m_1", name: "A" },
        { id: "m_2", name: "B" },
      ],
      error: null,
    });
    const { result } = renderHook(() => useFavoriteMakgeollis(), {
      wrapper: wrap(),
    });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(2);
    });

    expect(fromMock).toHaveBeenCalledWith("makgeolli");
    expect(selectMock).toHaveBeenCalledWith("*");
    expect(inMock).toHaveBeenCalledWith("id", ["m_1", "m_2"]);
  });
});
