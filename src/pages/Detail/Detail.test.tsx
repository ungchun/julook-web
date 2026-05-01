import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "@/test/utils";
import { Detail } from "./Detail";

// 외부 IO 모킹 — `@/shared/lib/supabase` 단일 지점.
const maybeSingleMock = vi.fn();
const eqMock = vi.fn();
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Detail page", () => {
  it("when /makgeolli/:id is loaded, then renders detail page with the id", () => {
    renderWithProviders(
      <Routes>
        <Route path="/makgeolli/:id" element={<Detail />} />
      </Routes>,
      { route: "/makgeolli/abc-123" },
    );

    expect(screen.getByTestId("detail-id")).toHaveTextContent("abc-123");
  });

  it("when /makgeolli/:id loads, then fetches makgeolli by id and renders name/brewery/alcohol/image", async () => {
    // Arrange: supabase가 단건 조회 결과를 반환
    const fixture = {
      id: "fixture-id",
      name: "느린마을 막걸리",
      brewery: "배상면주가",
      website: null,
      awards: null,
      sweetness: null,
      sourness: null,
      thickness: null,
      carbonation: null,
      has_sweetener: null,
      ingredients: null,
      alcohol_percentage: 6.5,
      image_name: "neurin",
      created_at: "2026-04-01T00:00:00.000Z",
      updated_at: null,
    };

    maybeSingleMock.mockResolvedValue({ data: fixture, error: null });
    eqMock.mockReturnValue({ maybeSingle: maybeSingleMock });
    selectMock.mockReturnValue({ eq: eqMock });
    fromMock.mockReturnValue({ select: selectMock });

    // Act
    renderWithProviders(
      <Routes>
        <Route path="/makgeolli/:id" element={<Detail />} />
      </Routes>,
      { route: "/makgeolli/fixture-id" },
    );

    // Assert: 페치 결과 핵심 정보가 비동기로 마운트됨
    expect(await screen.findByText("느린마을 막걸리")).toBeInTheDocument();
    expect(screen.getByText("배상면주가")).toBeInTheDocument();
    expect(screen.getByText("6.5%")).toBeInTheDocument();

    const image = screen.getByRole("img", { name: "느린마을 막걸리" });
    expect(image).toHaveAttribute("src", "https://example.com/image.png");

    // Supabase 쿼리 인자 검증 (iOS 본앱 명세 미러)
    expect(fromMock).toHaveBeenCalledWith("makgeolli");
    expect(selectMock).toHaveBeenCalledWith("*");
    expect(eqMock).toHaveBeenCalledWith("id", "fixture-id");
    expect(maybeSingleMock).toHaveBeenCalled();
  });

  it("when fetched data is null (not found), then renders not-found message", async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: null });
    eqMock.mockReturnValue({ maybeSingle: maybeSingleMock });
    selectMock.mockReturnValue({ eq: eqMock });
    fromMock.mockReturnValue({ select: selectMock });

    renderWithProviders(
      <Routes>
        <Route path="/makgeolli/:id" element={<Detail />} />
      </Routes>,
      { route: "/makgeolli/missing-id" },
    );

    expect(
      await screen.findByText("막걸리를 찾을 수 없습니다"),
    ).toBeInTheDocument();
  });
});
