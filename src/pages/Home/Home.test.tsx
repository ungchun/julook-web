import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import { Home } from "./Home";

// 외부 IO 모킹 — 실제 supabase 호출 차단.
// `@/shared/lib/supabase`만 모킹 (wrapper 단일 지점).
const orderMock = vi.fn();
const limitMock = vi.fn();
const selectMock = vi.fn();
const fromMock = vi.fn();
const getPublicUrlMock = vi
  .fn()
  .mockReturnValue({ data: { publicUrl: "https://example.com/image.png" } });
const storageFromMock = vi
  .fn()
  .mockReturnValue({ getPublicUrl: getPublicUrlMock });

vi.mock("@/shared/lib/supabase", () => ({
  supabase: {
    from: (table: string) => fromMock(table),
    storage: {
      from: (bucket: string) => storageFromMock(bucket),
    },
  },
}));

// 추가 섹션들은 D∙ 후속 사이클에서 추가 — Home의 신상 카드 시나리오와 무관 → stub.
vi.mock("@/features/popular", () => ({
  PopularSection: () => null,
}));
vi.mock("@/features/random", () => ({
  RandomMakgeolliSection: () => null,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Home", () => {
  it("renders the brand title", () => {
    renderWithProviders(<Home />);
    expect(screen.getByRole("heading", { name: "주룩" })).toBeInTheDocument();
  });

  it("when entering home, then renders 5 new release cards from supabase", async () => {
    // Arrange: supabase가 5개 막걸리를 반환하도록 체이닝 모킹
    const fixtures = Array.from({ length: 5 }, (_, i) => ({
      id: `id_${i + 1}`,
      name: `makgeolli_${i + 1}`,
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
      created_at: `2026-05-0${i + 1}T00:00:00.000Z`,
      updated_at: null,
    }));

    limitMock.mockResolvedValue({ data: fixtures, error: null });
    orderMock.mockReturnValue({ limit: limitMock });
    selectMock.mockReturnValue({ order: orderMock });
    fromMock.mockReturnValue({ select: selectMock });

    // Act
    renderWithProviders(<Home />);

    // Assert: 5개 카드가 비동기로 마운트됨
    const cards = await screen.findAllByTestId("makgeolli-card");
    expect(cards).toHaveLength(5);

    // 각 막걸리 이름이 보임
    for (const fixture of fixtures) {
      expect(screen.getByText(fixture.name)).toBeInTheDocument();
    }

    // Supabase 쿼리 인자 검증 (iOS 본앱 명세 미러)
    expect(fromMock).toHaveBeenCalledWith("makgeolli");
    expect(selectMock).toHaveBeenCalledWith("*");
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(limitMock).toHaveBeenCalledWith(5);
  });
});
