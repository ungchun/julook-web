import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "@/test/utils";
import { PopularSection } from "./PopularSection";
import type { Makgeolli } from "@/shared/types";

const useTopLikedRef = {
  current: () => ({ data: [] as Makgeolli[] | undefined }),
};

vi.mock("./use-top-liked", () => ({
  useTopLiked: () => useTopLikedRef.current(),
}));

const favoritesToggleMock = vi.fn();
const favoritesIsFavoriteRef: { current: (id: string) => boolean } = {
  current: () => false,
};

vi.mock("@/features/favorites", () => ({
  useFavorites: () => ({
    favorites: [],
    isFavorite: (id: string) => favoritesIsFavoriteRef.current(id),
    toggle: (id: string) => favoritesToggleMock(id),
  }),
}));

vi.mock("@/shared/lib/makgeolli-image", () => ({
  getMakgeolliImageUrl: (n: string | null) =>
    n ? `https://t.test/${n}.png` : null,
}));

function makeMakgeolli(overrides: Partial<Makgeolli> = {}): Makgeolli {
  return {
    id: "m_1",
    name: "느린마을",
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
    ...overrides,
  };
}

function DetailProbe() {
  return <div data-testid="detail-probe" />;
}

beforeEach(() => {
  vi.clearAllMocks();
  favoritesIsFavoriteRef.current = () => false;
});

describe("PopularSection — 우측 찜 버튼", () => {
  it("각 행 우측에 찜 버튼이 렌더된다", () => {
    useTopLikedRef.current = () => ({
      data: [
        makeMakgeolli({ id: "m_1", name: "Top1" }),
        makeMakgeolli({ id: "m_2", name: "Top2" }),
        makeMakgeolli({ id: "m_3", name: "Top3" }),
      ],
    });

    renderWithProviders(<PopularSection />);

    expect(screen.getAllByRole("button", { name: "찜하기" })).toHaveLength(3);
  });

  it("찜 버튼 클릭 시 toggle(makgeolliId) 호출 + Detail 로 navigate 되지 않는다", async () => {
    useTopLikedRef.current = () => ({
      data: [makeMakgeolli({ id: "abc-123", name: "Top1" })],
    });
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/" element={<PopularSection />} />
        <Route path="/makgeolli/:id" element={<DetailProbe />} />
      </Routes>,
    );

    await user.click(screen.getByRole("button", { name: "찜하기" }));
    expect(favoritesToggleMock).toHaveBeenCalledWith("abc-123");
    expect(screen.queryByTestId("detail-probe")).not.toBeInTheDocument();
  });

  it("이미 찜한 항목은 '찜 해제' aria-label + aria-pressed true", () => {
    favoritesIsFavoriteRef.current = (id) => id === "fav-only";
    useTopLikedRef.current = () => ({
      data: [
        makeMakgeolli({ id: "fav-only", name: "찜됨" }),
        makeMakgeolli({ id: "other", name: "비찜" }),
      ],
    });

    renderWithProviders(<PopularSection />);

    expect(
      screen.getByRole("button", { name: "찜 해제" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "찜하기" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
