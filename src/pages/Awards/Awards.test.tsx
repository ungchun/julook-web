import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "@/test/utils";
import { Awards } from "./Awards";
import type { Award, Makgeolli } from "@/shared/types";

// supabase from() 호출 인자별로 다른 chain mock 반환.
const awardsMaybeSingleMock = vi.fn();
const awardsEqMock = vi.fn();
const awardsSelectMock = vi.fn();
const makgeolliOrderCreatedMock = vi.fn();
const makgeolliOrderIdMock = vi.fn();
const makgeolliContainsMock = vi.fn();
const makgeolliSelectMock = vi.fn();
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
    storage: { from: (bucket: string) => storageFromMock(bucket) },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  awardsEqMock.mockReturnValue({ maybeSingle: awardsMaybeSingleMock });
  awardsSelectMock.mockReturnValue({ eq: awardsEqMock });
  makgeolliOrderIdMock.mockReturnValue({ order: makgeolliOrderCreatedMock });
  makgeolliContainsMock.mockReturnValue({ order: makgeolliOrderIdMock });
  makgeolliSelectMock.mockReturnValue({ contains: makgeolliContainsMock });

  fromMock.mockImplementation((table: string) => {
    if (table === "awards") return { select: awardsSelectMock };
    if (table === "makgeolli") return { select: makgeolliSelectMock };
    return {};
  });
});

function makeAward(overrides: Partial<Award> = {}): Award {
  return {
    id: "award-uuid-1",
    name: "2024 대한민국 주류대상",
    name_en: null,
    year: 2024,
    type: "korea_award",
    ...overrides,
  };
}

function makeMakgeolli(overrides: Partial<Makgeolli> = {}): Makgeolli {
  return {
    id: "m_1",
    name: "느린마을",
    brewery: null,
    website: null,
    awards: ["2024 대한민국 주류대상"],
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

describe("Awards page", () => {
  it("when /awards/:id loads, fetches award then makgeollis with award name and renders title + cards", async () => {
    awardsMaybeSingleMock.mockResolvedValue({
      data: makeAward(),
      error: null,
    });
    makgeolliOrderCreatedMock.mockResolvedValue({
      data: [
        makeMakgeolli({ id: "m_1", name: "느린마을" }),
        makeMakgeolli({ id: "m_2", name: "지평막걸리" }),
      ],
      error: null,
    });

    renderWithProviders(
      <Routes>
        <Route path="/awards/:awardId" element={<Awards />} />
      </Routes>,
      { route: "/awards/award-uuid-1" },
    );

    // iOS isTopicMode 미러: title 은 nav bar 안. 별도 큰 h1 없음.
    const nav = await screen.findByRole("navigation");
    expect(
      await within(nav).findByRole("heading", {
        name: "2024 대한민국 주류대상",
      }),
    ).toBeInTheDocument();

    await screen.findByText("느린마을");
    expect(screen.getByText("지평막걸리")).toBeInTheDocument();
    expect(screen.getAllByTestId("makgeolli-grid-card")).toHaveLength(2);

    expect(awardsEqMock).toHaveBeenCalledWith("id", "award-uuid-1");
    expect(makgeolliContainsMock).toHaveBeenCalledWith("awards", [
      "2024 대한민국 주류대상",
    ]);
  });

  it("when award not found, renders not-found message and does not fetch makgeollis", async () => {
    awardsMaybeSingleMock.mockResolvedValue({ data: null, error: null });

    renderWithProviders(
      <Routes>
        <Route path="/awards/:awardId" element={<Awards />} />
      </Routes>,
      { route: "/awards/missing" },
    );

    expect(
      await screen.findByText("수상 정보를 찾을 수 없습니다"),
    ).toBeInTheDocument();
    expect(makgeolliSelectMock).not.toHaveBeenCalled();
  });

  it("when award has no matching makgeolli, renders empty message", async () => {
    awardsMaybeSingleMock.mockResolvedValue({
      data: makeAward(),
      error: null,
    });
    makgeolliOrderCreatedMock.mockResolvedValue({ data: [], error: null });

    renderWithProviders(
      <Routes>
        <Route path="/awards/:awardId" element={<Awards />} />
      </Routes>,
      { route: "/awards/award-uuid-1" },
    );

    const nav = await screen.findByRole("navigation");
    await within(nav).findByRole("heading", { name: "2024 대한민국 주류대상" });
    expect(await screen.findByText("결과가 없어요")).toBeInTheDocument();
  });

  it("when card clicked, navigates to /makgeolli/:id", async () => {
    awardsMaybeSingleMock.mockResolvedValue({
      data: makeAward(),
      error: null,
    });
    makgeolliOrderCreatedMock.mockResolvedValue({
      data: [makeMakgeolli({ id: "abc-123", name: "느린마을" })],
      error: null,
    });
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/awards/:awardId" element={<Awards />} />
        <Route path="/makgeolli/:id" element={<DetailProbe />} />
      </Routes>,
      { route: "/awards/award-uuid-1" },
    );

    await screen.findByText("느린마을");
    await user.click(screen.getByTestId("makgeolli-grid-card"));

    expect(await screen.findByTestId("detail-probe")).toBeInTheDocument();
  });
});
