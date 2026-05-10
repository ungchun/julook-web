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
  useMyAllActivity: () => ({
    data: useMyAllActivityRef.current,
    isLoading: false,
  }),
  useMyReactionActivity: (type: "like" | "dislike") => ({
    data:
      type === "like"
        ? useMyLikedRef.current
        : useMyDislikedRef.current,
    isLoading: false,
  }),
  useMyCommentActivity: () => ({
    data: useMyCommentsRef.current,
    isLoading: false,
  }),
}));

vi.mock("@/shared/lib/identity", () => ({
  getOrCreateUserId: () => Promise.resolve(FIXED_USER_ID),
}));

const useMyAllActivityRef: { current: unknown } = { current: undefined };
const useMyLikedRef: { current: unknown } = { current: undefined };
const useMyDislikedRef: { current: unknown } = { current: undefined };
const useMyCommentsRef: { current: unknown } = { current: undefined };

beforeEach(() => {
  vi.clearAllMocks();
  useMyAllActivityRef.current = undefined;
  useMyLikedRef.current = undefined;
  useMyDislikedRef.current = undefined;
  useMyCommentsRef.current = undefined;
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

  it("when ?tab=like, renders MakgeolliCards from useMyReactionActivity('like')", async () => {
    useMyLikedRef.current = [
      { reactedAt: "2025-04-01T00:00:00Z", makgeolli: makeItem({}).makgeolli },
      {
        reactedAt: "2025-03-30T00:00:00Z",
        makgeolli: makeItem({ makgeolliId: "m_2", name: "지평" }).makgeolli,
      },
    ];

    renderWithProviders(
      <Routes>
        <Route path="/my-activity" element={<MyActivity />} />
      </Routes>,
      { route: "/my-activity?tab=like" },
    );

    await screen.findByText("느린마을");
    expect(screen.getByText("지평")).toBeInTheDocument();
    expect(screen.getAllByTestId("makgeolli-card")).toHaveLength(2);
  });

  it("when ?tab=dislike, renders cards from useMyReactionActivity('dislike')", async () => {
    useMyDislikedRef.current = [
      {
        reactedAt: "2025-04-01T00:00:00Z",
        makgeolli: makeItem({ name: "별로별로" }).makgeolli,
      },
    ];

    renderWithProviders(
      <Routes>
        <Route path="/my-activity" element={<MyActivity />} />
      </Routes>,
      { route: "/my-activity?tab=dislike" },
    );

    await screen.findByText("별로별로");
    expect(screen.getAllByTestId("makgeolli-card")).toHaveLength(1);
  });

  it("when ?tab=comment, renders CommentRow list from useMyCommentActivity", async () => {
    useMyCommentsRef.current = [
      {
        comment: {
          id: "c_1",
          user_id: FIXED_USER_ID,
          makgeolli_id: "m_1",
          comment: "내가 쓴 코멘트",
          is_public: true,
          created_at: "2025-04-01T00:00:00Z",
          updated_at: "2025-04-02T00:00:00Z",
        },
        makgeolli: makeItem({ makgeolliId: "m_1", name: "느린마을" }).makgeolli,
      },
    ];

    renderWithProviders(
      <Routes>
        <Route path="/my-activity" element={<MyActivity />} />
      </Routes>,
      { route: "/my-activity?tab=comment" },
    );

    expect(await screen.findByText("내가 쓴 코멘트")).toBeInTheDocument();
    expect(screen.getByText("느린마을")).toBeInTheDocument();
  });

  it("when ?tab=like and result is empty, renders '좋아요 한 막걸리가 없어요'", async () => {
    useMyLikedRef.current = [];

    renderWithProviders(
      <Routes>
        <Route path="/my-activity" element={<MyActivity />} />
      </Routes>,
      { route: "/my-activity?tab=like" },
    );

    expect(
      await screen.findByText("좋아요 한 막걸리가 없어요"),
    ).toBeInTheDocument();
  });
});
