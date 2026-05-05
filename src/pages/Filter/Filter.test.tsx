import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "@/test/utils";
import { Filter } from "./Filter";
import type { Makgeolli } from "@/shared/types";

// supabase chain 모킹
const orderCreatedAtMock = vi.fn();
const orderIdMock = vi.fn();
const predicateMock = vi.fn();
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
    storage: { from: (bucket: string) => storageFromMock(bucket) },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  fromMock.mockReturnValue({ select: selectMock });
  selectMock.mockReturnValue({ gte: predicateMock, eq: predicateMock });
  predicateMock.mockReturnValue({ order: orderIdMock });
  orderIdMock.mockReturnValue({ order: orderCreatedAtMock });
});

function makeMakgeolli(overrides: Partial<Makgeolli> = {}): Makgeolli {
  return {
    id: "id_1",
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

describe("Filter page", () => {
  it("when /filter/thick is loaded, renders '걸쭉한' title and fetches with thickness gte 3", async () => {
    orderCreatedAtMock.mockResolvedValue({ data: [], error: null });

    renderWithProviders(
      <Routes>
        <Route path="/filter/:type" element={<Filter />} />
      </Routes>,
      { route: "/filter/thick" },
    );

    expect(
      await screen.findByRole("heading", { name: "걸쭉한" }),
    ).toBeInTheDocument();
    expect(predicateMock).toHaveBeenCalledWith("thickness", 3);
  });

  it("when /filter/sweet has results, renders a card for each result", async () => {
    orderCreatedAtMock.mockResolvedValue({
      data: [
        makeMakgeolli({ id: "id_1", name: "달달이" }),
        makeMakgeolli({ id: "id_2", name: "단단이" }),
        makeMakgeolli({ id: "id_3", name: "꿀막걸리" }),
      ],
      error: null,
    });

    renderWithProviders(
      <Routes>
        <Route path="/filter/:type" element={<Filter />} />
      </Routes>,
      { route: "/filter/sweet" },
    );

    await screen.findByText("달달이");
    expect(screen.getByText("단단이")).toBeInTheDocument();
    expect(screen.getByText("꿀막걸리")).toBeInTheDocument();
    expect(screen.getAllByTestId("makgeolli-card")).toHaveLength(3);
  });

  it("when /filter/unknown is loaded, renders unsupported message and does not call supabase", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/filter/:type" element={<Filter />} />
      </Routes>,
      { route: "/filter/unknown" },
    );

    expect(
      await screen.findByText("지원하지 않는 필터입니다"),
    ).toBeInTheDocument();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("when result is empty, renders empty message", async () => {
    orderCreatedAtMock.mockResolvedValue({ data: [], error: null });

    renderWithProviders(
      <Routes>
        <Route path="/filter/:type" element={<Filter />} />
      </Routes>,
      { route: "/filter/sour" },
    );

    expect(
      await screen.findByText("결과가 없어요"),
    ).toBeInTheDocument();
  });

  it("when card clicked, navigates to /makgeolli/:id", async () => {
    orderCreatedAtMock.mockResolvedValue({
      data: [makeMakgeolli({ id: "abc-123", name: "느린마을" })],
      error: null,
    });
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/filter/:type" element={<Filter />} />
        <Route path="/makgeolli/:id" element={<DetailProbe />} />
      </Routes>,
      { route: "/filter/thick" },
    );

    await screen.findByText("느린마을");
    await user.click(screen.getByTestId("makgeolli-card"));

    expect(await screen.findByTestId("detail-probe")).toBeInTheDocument();
  });
});
