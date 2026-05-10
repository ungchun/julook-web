import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "@/test/utils";
import { RecentCommentsSection } from "./RecentCommentsSection";

// fetchRecentComments 단일 지점 모킹.
const fetchRecentCommentsMock = vi.fn();
const fetchUserReactionMock = vi.fn();

vi.mock("./api", () => ({
  fetchRecentComments: () => fetchRecentCommentsMock(),
  // 같은 모듈에 있는 fetchAllPublicComments 도 export 되어야 다른 곳에서 깨지지 않음 — 기본 stub.
  fetchAllPublicComments: () => Promise.resolve([]),
}));

vi.mock("@/features/reaction/api", () => ({
  fetchUserReaction: (...args: unknown[]) => fetchUserReactionMock(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  fetchUserReactionMock.mockResolvedValue(null);
  fetchRecentCommentsMock.mockResolvedValue([
    {
      comment: {
        id: "c_1",
        user_id: "u_1",
        makgeolli_id: "m_1",
        comment: "맛있어요",
        is_public: true,
        created_at: "2025-04-01T00:00:00Z",
        updated_at: "2025-04-01T00:00:00Z",
      },
      makgeolli: {
        id: "m_1",
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
    },
  ]);
});

function AllCommentsTargetProbe() {
  return <div data-testid="all-comments-target" />;
}

describe("RecentCommentsSection navigation", () => {
  it("when section header is clicked, navigates to /comments/all", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/" element={<RecentCommentsSection />} />
        <Route path="/comments/all" element={<AllCommentsTargetProbe />} />
      </Routes>,
      { route: "/" },
    );

    // 헤더 button (제목 + 화살표 영역)
    const header = await screen.findByRole("button", {
      name: /코멘트가 달렸어요/,
    });
    await user.click(header);

    expect(
      await screen.findByTestId("all-comments-target"),
    ).toBeInTheDocument();
  });

  it("renders reaction circle for each comment based on author reaction", async () => {
    fetchUserReactionMock.mockResolvedValue("like");

    renderWithProviders(<RecentCommentsSection />);

    const icons = await screen.findAllByTestId("comment-author-reaction");
    expect(icons[0]).toHaveAttribute(
      "src",
      "/assets/reaction/circle_like.svg",
    );
    expect(fetchUserReactionMock).toHaveBeenCalledWith("u_1", "m_1");
  });
});
