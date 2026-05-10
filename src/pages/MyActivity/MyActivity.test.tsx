import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "@/test/utils";
import { MyActivity } from "./MyActivity";

const fetchMyAllActivityMock = vi.fn();
const FIXED_USER_ID = "user-fixture-id";

vi.mock("@/features/my-activity", () => ({
  fetchMyAllActivity: (...args: unknown[]) => fetchMyAllActivityMock(...args),
  useMyAllActivity: () => ({ data: useMyAllActivityRef.current, isLoading: false }),
}));

vi.mock("@/shared/lib/identity", () => ({
  getOrCreateUserId: () => Promise.resolve(FIXED_USER_ID),
}));

const useMyAllActivityRef: { current: unknown } = { current: undefined };

beforeEach(() => {
  vi.clearAllMocks();
  useMyAllActivityRef.current = undefined;
});

function makeItem(overrides: { makgeolliId?: string; name?: string }) {
  return {
    lastActivityAt: "2025-04-01T00:00:00Z",
    makgeolli: {
      id: overrides.makgeolliId ?? "m_1",
      name: overrides.name ?? "느린마을",
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
    },
  };
}

function DetailProbe() {
  return <div data-testid="detail-probe" />;
}

describe("MyActivity page", () => {
  it("when /my-activity loads, renders title and 4 sub-tabs", async () => {
    useMyAllActivityRef.current = [];

    renderWithProviders(
      <Routes>
        <Route path="/my-activity" element={<MyActivity />} />
      </Routes>,
      { route: "/my-activity" },
    );

    expect(
      await screen.findByRole("heading", { name: "내 활동" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "전체" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "좋아요" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "싫어요" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "코멘트" }),
    ).toBeInTheDocument();
  });

  it("when 'all' is active (default), renders MakgeolliCards from useMyAllActivity", async () => {
    useMyAllActivityRef.current = [
      makeItem({ makgeolliId: "m_1", name: "느린마을" }),
      makeItem({ makgeolliId: "m_2", name: "지평" }),
    ];

    renderWithProviders(
      <Routes>
        <Route path="/my-activity" element={<MyActivity />} />
      </Routes>,
      { route: "/my-activity" },
    );

    await screen.findByText("느린마을");
    expect(screen.getByText("지평")).toBeInTheDocument();
    expect(screen.getAllByTestId("makgeolli-card")).toHaveLength(2);
  });

  it("when '좋아요' tab clicked, URL changes to ?tab=like and shows '준비 중' placeholder", async () => {
    useMyAllActivityRef.current = [];
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/my-activity" element={<MyActivity />} />
      </Routes>,
      { route: "/my-activity" },
    );

    await user.click(screen.getByRole("button", { name: "좋아요" }));

    expect(await screen.findByText("준비 중입니다")).toBeInTheDocument();
  });

  it("when ?tab=comment is loaded, that tab is highlighted as active", async () => {
    useMyAllActivityRef.current = [];

    renderWithProviders(
      <Routes>
        <Route path="/my-activity" element={<MyActivity />} />
      </Routes>,
      { route: "/my-activity?tab=comment" },
    );

    const commentTab = await screen.findByRole("button", { name: "코멘트" });
    expect(commentTab).toHaveAttribute("aria-current", "true");
  });

  it("when card clicked, navigates to /makgeolli/:id", async () => {
    useMyAllActivityRef.current = [
      makeItem({ makgeolliId: "abc-123", name: "느린마을" }),
    ];
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/my-activity" element={<MyActivity />} />
        <Route path="/makgeolli/:id" element={<DetailProbe />} />
      </Routes>,
      { route: "/my-activity" },
    );

    await screen.findByText("느린마을");
    await user.click(screen.getByTestId("makgeolli-card"));

    expect(await screen.findByTestId("detail-probe")).toBeInTheDocument();
  });
});
