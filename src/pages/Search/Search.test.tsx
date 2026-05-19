import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "@/test/utils";
import { Search } from "./Search";

const searchMakgeollisMock = vi.fn();
const loadRecentSearchesMock = vi.fn();
const saveRecentSearchesMock = vi.fn();

vi.mock("@/features/search", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/features/search")>();
  return {
    ...actual,
    searchMakgeollis: (...args: unknown[]) => searchMakgeollisMock(...args),
    useSearch: (query: string) => useSearchRef.current(query),
  };
});

vi.mock("@/shared/lib/recent-searches", () => ({
  loadRecentSearches: () => loadRecentSearchesMock(),
  saveRecentSearches: (items: string[]) => saveRecentSearchesMock(items),
}));

const useSearchRef: {
  current: (query: string) => {
    data: unknown;
    isLoading: boolean;
    isError?: boolean;
    refetch?: () => void;
  };
} = {
  current: () => ({ data: undefined, isLoading: false }),
};

beforeEach(() => {
  vi.clearAllMocks();
  useSearchRef.current = () => ({ data: undefined, isLoading: false });
  loadRecentSearchesMock.mockResolvedValue([]);
  saveRecentSearchesMock.mockResolvedValue(undefined);
});

function makeMakgeolli(id: string, name: string) {
  return {
    id,
    name,
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
  };
}

function DetailProbe() {
  return <div data-testid="detail-probe" />;
}

describe("Search page", () => {
  it("when /search loads, renders input and empty state prompt", async () => {
    renderWithProviders(<Search />);

    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(
      screen.getByText("막걸리 이름을 검색해 보세요"),
    ).toBeInTheDocument();
  });

  it("when user types, query is debounced and results are rendered", async () => {
    const user = userEvent.setup();
    useSearchRef.current = (q: string) => {
      if (q === "느린") {
        return {
          data: [
            makeMakgeolli("m_1", "느린마을"),
            makeMakgeolli("m_2", "느린마을 골드"),
          ],
          isLoading: false,
        };
      }
      return { data: undefined, isLoading: false };
    };

    renderWithProviders(<Search />);

    const input = screen.getByRole("searchbox");
    await user.type(input, "느린");

    // debounce 후 useSearch 가 "느린" 으로 호출되고 결과가 렌더
    expect(await screen.findByText("느린마을")).toBeInTheDocument();
    expect(screen.getByText("느린마을 골드")).toBeInTheDocument();
    expect(screen.getAllByTestId("makgeolli-card")).toHaveLength(2);
  });

  it("when results are empty for a query, renders '검색 결과가 없어요'", async () => {
    const user = userEvent.setup();
    useSearchRef.current = () => ({ data: [], isLoading: false });

    renderWithProviders(<Search />);

    await user.type(screen.getByRole("searchbox"), "abc");
    expect(
      await screen.findByText("검색 결과가 없어요"),
    ).toBeInTheDocument();
  });

  it("when clear button clicked, input is cleared back to empty prompt", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Search />);

    const input = screen.getByRole("searchbox") as HTMLInputElement;
    await user.type(input, "abc");
    expect(input.value).toBe("abc");

    await user.click(screen.getByRole("button", { name: "지우기" }));
    expect(input.value).toBe("");
    expect(
      screen.getByText("막걸리 이름을 검색해 보세요"),
    ).toBeInTheDocument();
  });

  it("when useSearch errors, renders ErrorState with retry button that triggers refetch", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    useSearchRef.current = () => ({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });

    renderWithProviders(<Search />);

    await user.type(screen.getByRole("searchbox"), "abc");

    expect(
      await screen.findByText("잠시 후 다시 시도해주세요"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("when card clicked, navigates to /makgeolli/:id", async () => {
    const user = userEvent.setup();
    useSearchRef.current = () => ({
      data: [makeMakgeolli("abc-123", "느린마을")],
      isLoading: false,
    });

    renderWithProviders(
      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/makgeolli/:id" element={<DetailProbe />} />
      </Routes>,
    );

    await user.type(screen.getByRole("searchbox"), "느린");
    await screen.findByText("느린마을");
    await user.click(screen.getByTestId("makgeolli-card"));

    expect(await screen.findByTestId("detail-probe")).toBeInTheDocument();
  });

  it("when query is empty and recent searches exist, renders the list (not EmptyState)", async () => {
    loadRecentSearchesMock.mockResolvedValueOnce(["느린마을", "지평"]);

    renderWithProviders(<Search />);

    expect(
      await screen.findByRole("heading", { name: "최근 검색어" }),
    ).toBeInTheDocument();
    expect(screen.getByText("느린마을")).toBeInTheDocument();
    expect(screen.getByText("지평")).toBeInTheDocument();
    expect(
      screen.queryByText("막걸리 이름을 검색해 보세요"),
    ).not.toBeInTheDocument();
  });

  it("clicking a recent search item fills the input and triggers search", async () => {
    loadRecentSearchesMock.mockResolvedValueOnce(["느린마을"]);
    useSearchRef.current = (q: string) =>
      q === "느린마을"
        ? { data: [makeMakgeolli("m_1", "느린마을")], isLoading: false }
        : { data: undefined, isLoading: false };
    const user = userEvent.setup();

    renderWithProviders(<Search />);

    await user.click(await screen.findByText("느린마을"));
    expect(
      (screen.getByRole("searchbox") as HTMLInputElement).value,
    ).toBe("느린마을");
    expect(await screen.findByTestId("makgeolli-card")).toBeInTheDocument();
  });

  it("when search returns 100 results, only first 20 cards are rendered", async () => {
    const fixtures = Array.from({ length: 100 }, (_, i) =>
      makeMakgeolli(`m_${i}`, `막걸리_${i}`),
    );
    useSearchRef.current = (q: string) =>
      q === "느린"
        ? { data: fixtures, isLoading: false }
        : { data: undefined, isLoading: false };
    const user = userEvent.setup();

    renderWithProviders(<Search />);
    await user.type(screen.getByRole("searchbox"), "느린");

    const cards = await screen.findAllByTestId("makgeolli-card");
    expect(cards).toHaveLength(20);
    expect(screen.getByTestId("infinite-sentinel")).toBeInTheDocument();
  });

  it("when query changes, page resets to first 20", async () => {
    const fixturesA = Array.from({ length: 50 }, (_, i) =>
      makeMakgeolli(`a_${i}`, `A_${i}`),
    );
    const fixturesB = Array.from({ length: 30 }, (_, i) =>
      makeMakgeolli(`b_${i}`, `B_${i}`),
    );
    useSearchRef.current = (q: string) => {
      if (q === "A") return { data: fixturesA, isLoading: false };
      if (q === "B") return { data: fixturesB, isLoading: false };
      return { data: undefined, isLoading: false };
    };
    const user = userEvent.setup();

    renderWithProviders(<Search />);
    const input = screen.getByRole("searchbox") as HTMLInputElement;
    await user.type(input, "A");
    await waitFor(() =>
      expect(screen.getAllByTestId("makgeolli-card")).toHaveLength(20),
    );

    await user.clear(input);
    await user.type(input, "B");
    await waitFor(() => {
      expect(screen.getAllByTestId("makgeolli-card")).toHaveLength(20);
      expect(screen.getByText("B_0")).toBeInTheDocument();
    });
  });

  it("clicking a card adds the current query to recent searches", async () => {
    const user = userEvent.setup();
    useSearchRef.current = (q: string) =>
      q === "느린"
        ? { data: [makeMakgeolli("m_1", "느린마을")], isLoading: false }
        : { data: undefined, isLoading: false };

    renderWithProviders(
      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/makgeolli/:id" element={<DetailProbe />} />
      </Routes>,
    );

    // 초기 마운트 — useRecentSearches 가 loadRecentSearches() 호출 → 빈 배열로 resolve
    await waitFor(() => {
      expect(loadRecentSearchesMock).toHaveBeenCalled();
    });

    await user.type(screen.getByRole("searchbox"), "느린");
    await screen.findByText("느린마을");
    await user.click(screen.getByTestId("makgeolli-card"));

    await waitFor(() => {
      expect(saveRecentSearchesMock).toHaveBeenCalledWith(["느린"]);
    });
  });
});
