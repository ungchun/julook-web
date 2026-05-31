import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "@/test/utils";
import { Filter } from "./Filter";
import type { Makgeolli } from "@/shared/types";

// supabase chain 모킹 — 페이지네이션 chain:
// from → select → (predicate*) → order(id) → order(created_at) → range → Promise
const rangeMock = vi.fn();
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
  selectMock.mockReturnValue({
    gte: predicateMock,
    eq: predicateMock,
    order: orderIdMock,
  });
  predicateMock.mockReturnValue({
    gte: predicateMock,
    eq: predicateMock,
    order: orderIdMock,
  });
  orderIdMock.mockReturnValue({ order: orderCreatedAtMock });
  orderCreatedAtMock.mockReturnValue({ range: rangeMock });
  rangeMock.mockResolvedValue({ data: [], error: null });
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
    rangeMock.mockResolvedValue({ data: [], error: null });

    renderWithProviders(
      <Routes>
        <Route path="/filter/:type" element={<Filter />} />
      </Routes>,
      { route: "/filter/thick" },
    );

    expect(
      await screen.findByRole("heading", { name: "특징으로 찾기" }),
    ).toBeInTheDocument();
    // 진입 deep-link로 thick 칩이 active 상태여야 함
    expect(screen.getByRole("button", { name: "걸쭉한" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(predicateMock).toHaveBeenCalledWith("thickness", 3);
  });

  it("/filter (type 없음) 진입 시 칩 모두 비활성 + 전체 fetch (predicate 호출 0)", async () => {
    rangeMock.mockResolvedValue({ data: [], error: null });

    renderWithProviders(
      <Routes>
        <Route path="/filter" element={<Filter />} />
      </Routes>,
      { route: "/filter" },
    );

    await screen.findByRole("heading", { name: "특징으로 찾기" });
    expect(predicateMock).not.toHaveBeenCalled();
    // 칩이 5개 모두 미선택
    for (const label of [
      "걸쭉한",
      "달달한",
      "시큼한",
      "탄산감 많은",
      "감미료 없는",
    ]) {
      expect(screen.getByRole("button", { name: label })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    }
  });

  it("정렬 셀렉터의 기본값은 추천순 + 3개 옵션 노출", async () => {
    rangeMock.mockResolvedValue({ data: [], error: null });

    renderWithProviders(
      <Routes>
        <Route path="/filter/:type" element={<Filter />} />
      </Routes>,
      { route: "/filter/thick" },
    );

    const select = (await screen.findByLabelText(
      "정렬 선택",
    )) as HTMLSelectElement;
    expect(select.value).toBe("recommended");
    expect(Array.from(select.options).map((o) => o.value)).toEqual([
      "recommended",
      "highAlcohol",
      "lowAlcohol",
    ]);
  });

  it("정렬 변경 시 클라이언트 정렬 — 서버 재조회는 일어나지 않는다", async () => {
    rangeMock.mockResolvedValue({
      data: [
        makeMakgeolli({ id: "low", name: "약함", alcohol_percentage: 5 }),
        makeMakgeolli({ id: "high", name: "강함", alcohol_percentage: 15 }),
      ],
      error: null,
    });
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/filter/:type" element={<Filter />} />
      </Routes>,
      { route: "/filter/thick" },
    );

    await screen.findByText("강함");
    const callsBefore = orderCreatedAtMock.mock.calls.length;

    await user.selectOptions(screen.getByLabelText("정렬 선택"), "highAlcohol");

    // 정렬 변경 후에도 서버 fetch 추가 호출 없음
    expect(orderCreatedAtMock.mock.calls.length).toBe(callsBefore);

    // displayed 순서가 강함→약함 (highAlcohol)
    const cards = screen.getAllByTestId("makgeolli-grid-card");
    expect(cards[0]).toHaveTextContent("강함");
    expect(cards[1]).toHaveTextContent("약함");
  });

  it("when /filter/sweet has results, renders a card for each result", async () => {
    rangeMock.mockResolvedValue({
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
    expect(screen.getAllByTestId("makgeolli-grid-card")).toHaveLength(3);
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
    rangeMock.mockResolvedValue({ data: [], error: null });

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
    rangeMock.mockResolvedValue({
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
    await user.click(screen.getByTestId("makgeolli-grid-card"));

    expect(await screen.findByTestId("detail-probe")).toBeInTheDocument();
  });
});
