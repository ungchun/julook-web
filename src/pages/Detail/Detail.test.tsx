import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "@/test/utils";
import { Detail } from "./Detail";
import type { Makgeolli } from "@/shared/types";

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

// 헬퍼: 모든 필드 null로 초기화한 fixture
function makeFixture(overrides: Partial<Makgeolli> = {}): Makgeolli {
  return {
    id: "fixture-id",
    name: "느린마을 막걸리",
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

function setupSupabase(fixture: Makgeolli | null): void {
  maybeSingleMock.mockResolvedValue({ data: fixture, error: null });
  eqMock.mockReturnValue({ maybeSingle: maybeSingleMock });
  selectMock.mockReturnValue({ eq: eqMock });
  fromMock.mockReturnValue({ select: selectMock });
}

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
    setupSupabase(
      makeFixture({
        brewery: "배상면주가",
        alcohol_percentage: 6.5,
        image_name: "neurin",
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/makgeolli/:id" element={<Detail />} />
      </Routes>,
      { route: "/makgeolli/fixture-id" },
    );

    expect(await screen.findByText("느린마을 막걸리")).toBeInTheDocument();
    expect(screen.getByText("배상면주가")).toBeInTheDocument();
    expect(screen.getByText("6.5%")).toBeInTheDocument();

    const image = screen.getByRole("img", { name: "느린마을 막걸리" });
    expect(image).toHaveAttribute("src", "https://example.com/image.png");

    expect(fromMock).toHaveBeenCalledWith("makgeolli");
    expect(selectMock).toHaveBeenCalledWith("*");
    expect(eqMock).toHaveBeenCalledWith("id", "fixture-id");
    expect(maybeSingleMock).toHaveBeenCalled();
  });

  it("when fetched data is null (not found), then renders not-found message", async () => {
    setupSupabase(null);

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

  it("when taste scores are present, then renders 4 taste columns with scores", async () => {
    setupSupabase(
      makeFixture({
        sweetness: 4,
        sourness: 2,
        thickness: 5,
        carbonation: 0,
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/makgeolli/:id" element={<Detail />} />
      </Routes>,
      { route: "/makgeolli/fixture-id" },
    );

    const tasteSection = await screen.findByTestId("taste-scores");
    expect(tasteSection).toHaveTextContent("달");
    expect(tasteSection).toHaveTextContent("4");
    expect(tasteSection).toHaveTextContent("시");
    expect(tasteSection).toHaveTextContent("2");
    expect(tasteSection).toHaveTextContent("걸");
    expect(tasteSection).toHaveTextContent("5");
    expect(tasteSection).toHaveTextContent("탄");
    expect(tasteSection).toHaveTextContent("0");
  });

  it("when taste score is null, then renders dash placeholder", async () => {
    setupSupabase(
      makeFixture({
        sweetness: 3,
        sourness: null,
        thickness: null,
        carbonation: null,
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/makgeolli/:id" element={<Detail />} />
      </Routes>,
      { route: "/makgeolli/fixture-id" },
    );

    const tasteSection = await screen.findByTestId("taste-scores");
    expect(tasteSection).toHaveTextContent("3");
    // 시/걸/탄은 null → "-"
    const dashes = tasteSection.querySelectorAll('[data-testid="taste-score"]');
    const nullCount = Array.from(dashes).filter(
      (el) => el.textContent?.includes("-"),
    ).length;
    expect(nullCount).toBe(3);
  });

  it("when awards exist, then renders awards section with each award", async () => {
    setupSupabase(
      makeFixture({
        awards: [
          "2023 대한민국주류대상 대상",
          "2022 우리술품평회 최우수",
        ],
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/makgeolli/:id" element={<Detail />} />
      </Routes>,
      { route: "/makgeolli/fixture-id" },
    );

    const awards = await screen.findByTestId("awards");
    expect(awards).toHaveTextContent("수상");
    expect(awards).toHaveTextContent("2023 대한민국주류대상 대상");
    expect(awards).toHaveTextContent("2022 우리술품평회 최우수");
  });

  it("when awards is null or empty, then awards section is not rendered", async () => {
    setupSupabase(makeFixture({ awards: null }));

    renderWithProviders(
      <Routes>
        <Route path="/makgeolli/:id" element={<Detail />} />
      </Routes>,
      { route: "/makgeolli/fixture-id" },
    );

    await screen.findByText("느린마을 막걸리");
    expect(screen.queryByTestId("awards")).not.toBeInTheDocument();
  });

  it("when ingredients exist, then renders ingredients section joined by comma", async () => {
    setupSupabase(
      makeFixture({
        ingredients: ["쌀", "누룩", "물", "정제효소"],
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/makgeolli/:id" element={<Detail />} />
      </Routes>,
      { route: "/makgeolli/fixture-id" },
    );

    const ingredients = await screen.findByTestId("ingredients");
    expect(ingredients).toHaveTextContent("원재료");
    expect(ingredients).toHaveTextContent("쌀, 누룩, 물, 정제효소");
  });

  it("when ingredients is null, then ingredients section is not rendered", async () => {
    setupSupabase(makeFixture({ ingredients: null }));

    renderWithProviders(
      <Routes>
        <Route path="/makgeolli/:id" element={<Detail />} />
      </Routes>,
      { route: "/makgeolli/fixture-id" },
    );

    await screen.findByText("느린마을 막걸리");
    expect(screen.queryByTestId("ingredients")).not.toBeInTheDocument();
  });

  it("when brewery and website both exist, then renders brewery as external link", async () => {
    setupSupabase(
      makeFixture({
        brewery: "배상면주가",
        website: "https://baesangmyun.com",
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/makgeolli/:id" element={<Detail />} />
      </Routes>,
      { route: "/makgeolli/fixture-id" },
    );

    const link = await screen.findByRole("link", { name: "배상면주가" });
    expect(link).toHaveAttribute("href", "https://baesangmyun.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("when website is null, then brewery website section is not rendered", async () => {
    setupSupabase(
      makeFixture({
        brewery: "배상면주가",
        website: null,
      }),
    );

    renderWithProviders(
      <Routes>
        <Route path="/makgeolli/:id" element={<Detail />} />
      </Routes>,
      { route: "/makgeolli/fixture-id" },
    );

    await screen.findByText("느린마을 막걸리");
    expect(screen.queryByTestId("brewery-website")).not.toBeInTheDocument();
  });
});
