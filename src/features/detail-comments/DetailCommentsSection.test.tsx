import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import { DetailCommentsSection } from "./DetailCommentsSection";
import type { UserComment } from "@/shared/types";

const fetchDetailCommentsMock = vi.fn();

vi.mock("./api", () => ({
  fetchDetailComments: (...args: unknown[]) =>
    fetchDetailCommentsMock(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
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

    const { container } = renderWithProviders(
      <DetailCommentsSection makgeolliId={MAKGEOLLI_ID} />,
    );

    // 비동기 fetch 완료 대기 — 호출 자체는 일어나야 함
    await vi.waitFor(() => {
      expect(fetchDetailCommentsMock).toHaveBeenCalled();
    });

    expect(screen.queryByTestId("detail-comments")).not.toBeInTheDocument();
    expect(container.textContent).toBe("");
  });

  it("when makgeolliId is undefined, does not call supabase fetch", async () => {
    renderWithProviders(<DetailCommentsSection makgeolliId={undefined} />);

    // tick 대기
    await new Promise((r) => setTimeout(r, 10));

    expect(fetchDetailCommentsMock).not.toHaveBeenCalled();
    expect(screen.queryByTestId("detail-comments")).not.toBeInTheDocument();
  });
});
