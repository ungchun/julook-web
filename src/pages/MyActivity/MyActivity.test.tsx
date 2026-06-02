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

vi.mock("@/features/favorites", () => ({
  useFavoriteMakgeollis: () => ({
    data: useFavoriteMakgeollisRef.current,
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("@/shared/lib/identity", () => ({
  getOrCreateUserId: () => Promise.resolve(FIXED_USER_ID),
}));

const useMyAllActivityRef: { current: unknown } = { current: undefined };
const useMyLikedRef: { current: unknown } = { current: undefined };
const useMyDislikedRef: { current: unknown } = { current: undefined };
const useMyCommentsRef: { current: unknown } = { current: undefined };
const useFavoriteMakgeollisRef: { current: unknown } = { current: undefined };

beforeEach(() => {
  vi.clearAllMocks();
  useMyAllActivityRef.current = undefined;
  useMyLikedRef.current = undefined;
  useMyDislikedRef.current = undefined;
  useMyCommentsRef.current = undefined;
  useFavoriteMakgeollisRef.current = undefined;
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
    expect(screen.getByRole("button", { name: "찜" })).toBeInTheDocument();
  });

  it("when ?tab=favorite, '찜' 탭이 활성 + useFavoriteMakgeollis 결과 카드 렌더", async () => {
    useFavoriteMakgeollisRef.current = [
      {
        id: "fm_1",
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
      },
    ];

    renderWithProviders(
      <Routes>
        <Route path="/my-activity" element={<MyActivity />} />
      </Routes>,
      { route: "/my-activity?tab=favorite" },
    );

    expect(await screen.findByRole("button", { name: "찜" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(await screen.findByText("느린마을")).toBeInTheDocument();
  });

  it("전체 탭 — reaction/comment 없어도 찜한 막걸리는 카드로 표시된다", async () => {
    useMyAllActivityRef.current = [];
    useFavoriteMakgeollisRef.current = [
      {
        id: "fav-only-1",
        name: "찜만한막걸리",
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
    ];

    renderWithProviders(
      <Routes>
        <Route path="/my-activity" element={<MyActivity />} />
      </Routes>,
      { route: "/my-activity" },
    );

    expect(await screen.findByText("찜만한막걸리")).toBeInTheDocument();
    expect(
      screen.queryByText("비어있어요"),
    ).not.toBeInTheDocument();
  });

  it("전체 탭 — reaction 과 찜이 같은 막걸리면 중복 없이 1장만 표시", async () => {
    useMyAllActivityRef.current = [
      makeItem({ makgeolliId: "dup_1", name: "중복막걸리" }),
    ];
    useFavoriteMakgeollisRef.current = [
      {
        id: "dup_1",
        name: "중복막걸리",
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
    ];

    renderWithProviders(
      <Routes>
        <Route path="/my-activity" element={<MyActivity />} />
      </Routes>,
      { route: "/my-activity" },
    );

    await screen.findByText("중복막걸리");
    expect(screen.getAllByTestId("makgeolli-grid-card")).toHaveLength(1);
  });

  it("when ?tab=favorite + 찜 없음 → '비어있어요' empty", async () => {
    useFavoriteMakgeollisRef.current = [];

    renderWithProviders(
      <Routes>
        <Route path="/my-activity" element={<MyActivity />} />
      </Routes>,
      { route: "/my-activity?tab=favorite" },
    );

    expect(
      await screen.findByText("비어있어요"),
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
    expect(screen.getAllByTestId("makgeolli-grid-card")).toHaveLength(2);
  });

  it("when '좋아요' tab clicked, URL changes to ?tab=like and like content is shown", async () => {
    useMyAllActivityRef.current = [];
    useMyLikedRef.current = [];
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/my-activity" element={<MyActivity />} />
      </Routes>,
      { route: "/my-activity" },
    );

    await user.click(screen.getByRole("button", { name: "좋아요" }));

    // like 탭으로 전환되면 useMyReactionActivity('like') 결과(빈 배열)에 따라
    // EmptyState 가 표시됨
    expect(
      await screen.findByText("비어있어요"),
    ).toBeInTheDocument();
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
    await user.click(screen.getByTestId("makgeolli-grid-card"));

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
    expect(screen.getAllByTestId("makgeolli-grid-card")).toHaveLength(2);
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
    expect(screen.getAllByTestId("makgeolli-grid-card")).toHaveLength(1);
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

  it("when ?tab=like and result is empty, renders '비어있어요'", async () => {
    useMyLikedRef.current = [];

    renderWithProviders(
      <Routes>
        <Route path="/my-activity" element={<MyActivity />} />
      </Routes>,
      { route: "/my-activity?tab=like" },
    );

    expect(
      await screen.findByText("비어있어요"),
    ).toBeInTheDocument();
  });
});
