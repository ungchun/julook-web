import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import { DetailCommentsSection } from "./DetailCommentsSection";
import type { UserComment } from "@/shared/types";

const fetchDetailCommentsMock = vi.fn();
const fetchUserReactionMock = vi.fn();

vi.mock("./api", () => ({
  fetchDetailComments: (...args: unknown[]) =>
    fetchDetailCommentsMock(...args),
}));

vi.mock("@/features/reaction/api", () => ({
  fetchUserReaction: (...args: unknown[]) => fetchUserReactionMock(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  fetchUserReactionMock.mockResolvedValue(null);
});

const MAKGEOLLI_ID = "makgeolli-fixture-id";

function makeComment(overrides: Partial<UserComment> = {}): UserComment {
  return {
    id: "c1",
    user_id: "u1",
    makgeolli_id: MAKGEOLLI_ID,
    comment: "기본 코멘트",
    is_public: true,
    created_at: "2025-04-01T00:00:00Z",
    updated_at: "2025-04-01T00:00:00Z",
    ...overrides,
  };
}

describe("DetailCommentsSection", () => {
  it("when comments exist, renders title and each comment body + formatted date", async () => {
    fetchDetailCommentsMock.mockResolvedValue([
      makeComment({
        id: "c1",
        comment: "정말 깔끔하고 맛있어요",
        created_at: "2025-04-01T00:00:00Z",
      }),
      makeComment({
        id: "c2",
        comment: "탄산이 살아있는 느낌",
        created_at: "2025-03-15T00:00:00Z",
      }),
    ]);

    renderWithProviders(
      <DetailCommentsSection makgeolliId={MAKGEOLLI_ID} />,
    );

    const section = await screen.findByTestId("detail-comments");
    expect(section).toHaveTextContent("코멘트");
    expect(section).toHaveTextContent("정말 깔끔하고 맛있어요");
    expect(section).toHaveTextContent("탄산이 살아있는 느낌");
    expect(section).toHaveTextContent("2025년 4월 1일");
    expect(section).toHaveTextContent("2025년 3월 15일");

    expect(screen.getAllByTestId("detail-comment-item")).toHaveLength(2);
    expect(fetchDetailCommentsMock).toHaveBeenCalledWith(MAKGEOLLI_ID);
  });

  it("when comments list is empty, renders nothing", async () => {
    fetchDetailCommentsMock.mockResolvedValue([]);

    renderWithProviders(<DetailCommentsSection makgeolliId={MAKGEOLLI_ID} />);

    // fetch 완료 + skeleton 사라질 때까지 대기
    await vi.waitFor(() => {
      expect(fetchDetailCommentsMock).toHaveBeenCalled();
      expect(
        screen.queryByTestId("comment-skeleton-row"),
      ).not.toBeInTheDocument();
    });

    expect(screen.queryByTestId("detail-comments")).not.toBeInTheDocument();
  });

  it("while loading, renders CommentRowSkeleton", async () => {
    // 영원히 resolve 되지 않는 promise — isLoading true 유지
    fetchDetailCommentsMock.mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<DetailCommentsSection makgeolliId={MAKGEOLLI_ID} />);

    expect(
      await screen.findAllByTestId("comment-skeleton-row"),
    ).not.toHaveLength(0);
  });

  it("when makgeolliId is undefined, does not call supabase fetch", async () => {
    renderWithProviders(<DetailCommentsSection makgeolliId={undefined} />);

    // tick 대기
    await new Promise((r) => setTimeout(r, 10));

    expect(fetchDetailCommentsMock).not.toHaveBeenCalled();
    expect(screen.queryByTestId("detail-comments")).not.toBeInTheDocument();
  });

  it("renders reaction circle for each comment based on author reaction", async () => {
    fetchDetailCommentsMock.mockResolvedValue([
      makeComment({ id: "c1", user_id: "u_like" }),
      makeComment({ id: "c2", user_id: "u_dislike" }),
      makeComment({ id: "c3", user_id: "u_none" }),
    ]);
    fetchUserReactionMock.mockImplementation(async (userId: string) => {
      if (userId === "u_like") return "like";
      if (userId === "u_dislike") return "dislike";
      return null;
    });

    renderWithProviders(
      <DetailCommentsSection makgeolliId={MAKGEOLLI_ID} />,
    );

    await screen.findByTestId("detail-comments");
    const icons = await screen.findAllByTestId("comment-author-reaction");
    expect(icons).toHaveLength(3);
    expect(icons[0]).toHaveAttribute(
      "src",
      "/assets/reaction/circle_like.svg",
    );
    expect(icons[1]).toHaveAttribute(
      "src",
      "/assets/reaction/circle_dislike.svg",
    );
    expect(icons[2]).toHaveAttribute(
      "src",
      "/assets/reaction/circle_none.svg",
    );
  });
});
