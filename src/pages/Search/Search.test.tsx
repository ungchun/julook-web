import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "@/test/utils";
import { Search } from "./Search";

const searchMakgeollisMock = vi.fn();

vi.mock("@/features/search", () => ({
  searchMakgeollis: (...args: unknown[]) => searchMakgeollisMock(...args),
  useSearch: (query: string) => useSearchRef.current(query),
}));

const useSearchRef: {
  current: (query: string) => { data: unknown; isLoading: boolean };
} = {
  current: () => ({ data: undefined, isLoading: false }),
};

beforeEach(() => {
  vi.clearAllMocks();
  useSearchRef.current = () => ({ data: undefined, isLoading: false });
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
});
