import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "@/test/utils";
import { AllComments } from "./AllComments";

const fetchAllPublicCommentsMock = vi.fn();
const fetchUserReactionMock = vi.fn();

vi.mock("@/features/recent-comments", () => ({
  useAllPublicComments: () => ({
    data: undefined,
  }),
  // dynamically replaced per test via mockImplementation below
  RecentCommentsSection: () => null,
  fetchRecentComments: () => Promise.resolve([]),
  fetchAllPublicComments: () => fetchAllPublicCommentsMock(),
  useRecentComments: () => ({ data: undefined }),
}));

vi.mock("@/features/reaction/api", () => ({
  fetchUserReaction: (...args: unknown[]) => fetchUserReactionMock(...args),
}));

// useAllPublicComments 가 useQuery 래핑이므로 fetch 결과를 직접 담는 hook 으로 모킹할 수 없음.
// 대신 hook 모듈 자체를 다시 모킹.
vi.mock("@/features/recent-comments/use-all-public-comments", () => ({
  useAllPublicComments: () => ({
    data: useAllPublicCommentsDataRef.current,
    isLoading: useAllPublicCommentsLoadingRef.current,
    isError: false,
    refetch: () => {},
  }),
}));

const useAllPublicCommentsDataRef: { current: unknown } = { current: undefined };
const useAllPublicCommentsLoadingRef: { current: boolean } = { current: false };

beforeEach(() => {
  vi.clearAllMocks();
  useAllPublicCommentsDataRef.current = undefined;
  useAllPublicCommentsLoadingRef.current = false;
  fetchUserReactionMock.mockResolvedValue(null);
});

function makeItem(overrides: {
  commentId?: string;
  makgeolliId?: string;
  makgeolliName?: string;
  body?: string;
  createdAt?: string;
}) {
  return {
    comment: {
      id: overrides.commentId ?? "c_1",
      user_id: "u_1",
      makgeolli_id: overrides.makgeolliId ?? "m_1",
      comment: overrides.body ?? "맛있어요",
      is_public: true,
      created_at: overrides.createdAt ?? "2025-04-01T00:00:00Z",
      updated_at: overrides.createdAt ?? "2025-04-01T00:00:00Z",
    },
    makgeolli: {
      id: overrides.makgeolliId ?? "m_1",
      name: overrides.makgeolliName ?? "느린마을",
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

describe("AllComments page", () => {
  it("when /comments/all loads, renders title and each comment", async () => {
    useAllPublicCommentsDataRef.current = [
      makeItem({
        commentId: "c_1",
        makgeolliName: "느린마을",
        body: "맛있어요",
        createdAt: "2025-04-01T00:00:00Z",
      }),
      makeItem({
        commentId: "c_2",
        makgeolliId: "m_2",
        makgeolliName: "지평막걸리",
        body: "탄산 좋아요",
        createdAt: "2025-03-31T00:00:00Z",
      }),
    ];

    renderWithProviders(
      <Routes>
        <Route path="/comments/all" element={<AllComments />} />
      </Routes>,
      { route: "/comments/all" },
    );

    expect(
      await screen.findByRole("heading", { name: "코멘트가 달렸어요" }),
    ).toBeInTheDocument();

    expect(screen.getByText("느린마을")).toBeInTheDocument();
    expect(screen.getByText("맛있어요")).toBeInTheDocument();
    expect(screen.getByText("지평막걸리")).toBeInTheDocument();
    expect(screen.getByText("탄산 좋아요")).toBeInTheDocument();
    expect(screen.getByText("2025년 4월 1일")).toBeInTheDocument();

    expect(screen.getAllByTestId("all-comments-row")).toHaveLength(2);
  });

  it("when loading, renders CommentRowSkeleton instead of spinner", async () => {
    useAllPublicCommentsDataRef.current = undefined;
    useAllPublicCommentsLoadingRef.current = true;

    renderWithProviders(
      <Routes>
        <Route path="/comments/all" element={<AllComments />} />
      </Routes>,
      { route: "/comments/all" },
    );

    expect(
      await screen.findAllByTestId("comment-skeleton-row"),
    ).not.toHaveLength(0);
    expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
  });

  it("when comments are empty, renders empty message", async () => {
    useAllPublicCommentsDataRef.current = [];

    renderWithProviders(
      <Routes>
        <Route path="/comments/all" element={<AllComments />} />
      </Routes>,
      { route: "/comments/all" },
    );

    await screen.findByRole("heading", { name: "코멘트가 달렸어요" });
    expect(
      screen.getByText("공개된 코멘트가 없어요"),
    ).toBeInTheDocument();
  });

  it("when comment row clicked, navigates to /makgeolli/:id", async () => {
    useAllPublicCommentsDataRef.current = [
      makeItem({ makgeolliId: "abc-123", makgeolliName: "느린마을" }),
    ];
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/comments/all" element={<AllComments />} />
        <Route path="/makgeolli/:id" element={<DetailProbe />} />
      </Routes>,
      { route: "/comments/all" },
    );

    await screen.findByText("느린마을");
    await user.click(screen.getByTestId("all-comments-row"));

    expect(await screen.findByTestId("detail-probe")).toBeInTheDocument();
  });

  it("renders reaction circle for each comment based on author reaction", async () => {
    useAllPublicCommentsDataRef.current = [
      makeItem({ commentId: "c_1", makgeolliId: "m_1" }),
      makeItem({ commentId: "c_2", makgeolliId: "m_2", makgeolliName: "지평" }),
    ];
    fetchUserReactionMock.mockImplementation(
      async (_userId: string, makgeolliId: string) => {
        if (makgeolliId === "m_1") return "like";
        return "dislike";
      },
    );

    renderWithProviders(
      <Routes>
        <Route path="/comments/all" element={<AllComments />} />
      </Routes>,
      { route: "/comments/all" },
    );

    // reaction fetch 완료 후 src 갱신 대기
    await vi.waitFor(() => {
      const icons = screen.getAllByTestId("comment-author-reaction");
      expect(icons).toHaveLength(2);
      expect(icons[0]).toHaveAttribute(
        "src",
        "/assets/reaction/circle_like.svg",
      );
      expect(icons[1]).toHaveAttribute(
        "src",
        "/assets/reaction/circle_dislike.svg",
      );
    });
  });
});
