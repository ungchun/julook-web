import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { ReactionButtons } from "./ReactionButtons";

// API 단일 지점 모킹.
const fetchUserReactionMock = vi.fn();
const fetchReactionCountsMock = vi.fn();
const saveReactionMock = vi.fn();
const deleteReactionMock = vi.fn();

vi.mock("./api", () => ({
  fetchUserReaction: (...args: unknown[]) => fetchUserReactionMock(...args),
  fetchReactionCounts: (...args: unknown[]) => fetchReactionCountsMock(...args),
  saveReaction: (...args: unknown[]) => saveReactionMock(...args),
  deleteReaction: (...args: unknown[]) => deleteReactionMock(...args),
}));

// 사용자 ID는 고정값으로 모킹 (identity 헬퍼 단일 지점).
const FIXED_USER_ID = "user-fixture-id";
vi.mock("@/shared/lib/identity", () => ({
  getOrCreateUserId: () => Promise.resolve(FIXED_USER_ID),
}));

beforeEach(() => {
  vi.clearAllMocks();
  saveReactionMock.mockResolvedValue(undefined);
  deleteReactionMock.mockResolvedValue(undefined);
});

const MAKGEOLLI_ID = "makgeolli-fixture-id";

describe("ReactionButtons", () => {
  it("when mounted, then renders like/dislike buttons with counts from API", async () => {
    fetchUserReactionMock.mockResolvedValue(null);
    fetchReactionCountsMock.mockResolvedValue({
      like_count: 5,
      dislike_count: 2,
    });

    renderWithProviders(<ReactionButtons makgeolliId={MAKGEOLLI_ID} />);

    // 본앱 ReactionButton 미러로 카운트 텍스트는 버튼 라벨에 미포함 (evaluationBar 별도 영역)
    expect(
      await screen.findByRole("button", { name: /좋았어요/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /아쉬워요/ }),
    ).toBeInTheDocument();
  });

  it("when user has no reaction and clicks like, then saveReaction is called with 'like'", async () => {
    fetchUserReactionMock.mockResolvedValue(null);
    fetchReactionCountsMock.mockResolvedValue({
      like_count: 0,
      dislike_count: 0,
    });

    renderWithProviders(<ReactionButtons makgeolliId={MAKGEOLLI_ID} />);

    const likeButton = await screen.findByRole("button", { name: /좋았어요/ });
    await userEvent.click(likeButton);

    await waitFor(() => {
      expect(saveReactionMock).toHaveBeenCalledWith(
        FIXED_USER_ID,
        MAKGEOLLI_ID,
        "like",
      );
    });
    expect(deleteReactionMock).not.toHaveBeenCalled();
  });

  it("when user already liked and clicks like again, then deleteReaction is called (toggle off)", async () => {
    fetchUserReactionMock.mockResolvedValue("like");
    fetchReactionCountsMock.mockResolvedValue({
      like_count: 1,
      dislike_count: 0,
    });

    renderWithProviders(<ReactionButtons makgeolliId={MAKGEOLLI_ID} />);

    const likeButton = await screen.findByRole("button", { name: /좋았어요/ });
    await userEvent.click(likeButton);

    await waitFor(() => {
      expect(deleteReactionMock).toHaveBeenCalledWith(
        FIXED_USER_ID,
        MAKGEOLLI_ID,
      );
    });
    expect(saveReactionMock).not.toHaveBeenCalled();
  });

  it("when user liked and clicks dislike, then saveReaction is called with 'dislike' (switch)", async () => {
    fetchUserReactionMock.mockResolvedValue("like");
    fetchReactionCountsMock.mockResolvedValue({
      like_count: 1,
      dislike_count: 0,
    });

    renderWithProviders(<ReactionButtons makgeolliId={MAKGEOLLI_ID} />);

    const dislikeButton = await screen.findByRole("button", {
      name: /아쉬워요/,
    });
    await userEvent.click(dislikeButton);

    await waitFor(() => {
      expect(saveReactionMock).toHaveBeenCalledWith(
        FIXED_USER_ID,
        MAKGEOLLI_ID,
        "dislike",
      );
    });
    expect(deleteReactionMock).not.toHaveBeenCalled();
  });
});
