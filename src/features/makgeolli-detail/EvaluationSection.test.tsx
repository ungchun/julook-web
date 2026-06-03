import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { EvaluationSection } from "./EvaluationSection";
import type { UserComment } from "@/shared/types";

// iOS InformationView+Evaluation 의 publicCommentsStrip.prefix(5) 미러 검증.
// 외부 IO 는 한 단계 위 hook 결과를 stub — 데이터 흐름이 아니라
// "공개 코멘트 6개 이상이면 화면엔 5개만" 동작 회귀 방지가 목적.

const useReactionMock = vi.fn();
const useDetailCommentsMock = vi.fn();
const useCommentAuthorReactionsMock = vi.fn();

vi.mock("@/features/reaction/use-reaction", () => ({
  useReaction: (id: string) => useReactionMock(id),
}));

vi.mock("@/features/reaction", () => ({
  useCommentAuthorReactions: (comments: UserComment[] | undefined) =>
    useCommentAuthorReactionsMock(comments),
}));

vi.mock("@/features/detail-comments/use-detail-comments", () => ({
  useDetailComments: (id: string | undefined) => useDetailCommentsMock(id),
}));

function makeComment(idx: number): UserComment {
  return {
    id: `c_${idx}`,
    makgeolli_id: "m_1",
    user_id: `u_${idx}`,
    comment: `코멘트 ${idx}`,
    is_public: true,
    created_at: `2025-09-${10 + idx}T00:00:00Z`,
    updated_at: `2025-09-${10 + idx}T00:00:00Z`,
  };
}

describe("EvaluationSection", () => {
  it("공개 코멘트가 7개여도 카드는 5개만 가로 strip 에 렌더 (iOS prefix(5) 미러)", () => {
    const comments = Array.from({ length: 7 }, (_, i) => makeComment(i));
    useReactionMock.mockReturnValue({ counts: { like: 5, dislike: 0 } });
    useDetailCommentsMock.mockReturnValue({ data: comments });
    useCommentAuthorReactionsMock.mockReturnValue({ data: new Map() });

    renderWithProviders(<EvaluationSection makgeolliId="m_1" />);

    expect(screen.getAllByTestId("evaluation-comment-card")).toHaveLength(5);
    // 0~4번 코멘트만 렌더, 5/6 번은 잘려나감
    expect(screen.getByText("코멘트 0")).toBeInTheDocument();
    expect(screen.queryByText("코멘트 5")).not.toBeInTheDocument();
    expect(screen.queryByText("코멘트 6")).not.toBeInTheDocument();
  });

  it("공개 코멘트가 0개면 카드 없이 empty 안내가 표시된다", () => {
    useReactionMock.mockReturnValue({ counts: { like: 0, dislike: 0 } });
    useDetailCommentsMock.mockReturnValue({ data: [] });
    useCommentAuthorReactionsMock.mockReturnValue({ data: new Map() });

    renderWithProviders(<EvaluationSection makgeolliId="m_1" />);

    expect(screen.queryByTestId("evaluation-comment-card")).not.toBeInTheDocument();
    expect(screen.getByText("아직 코멘트가 없어요")).toBeInTheDocument();
  });

  it("초기 렌더 시 AllPublicCommentsSheet 가 노출되지 않는다", () => {
    const comments = [makeComment(0)];
    useReactionMock.mockReturnValue({ counts: { like: 1, dislike: 0 } });
    useDetailCommentsMock.mockReturnValue({
      data: comments,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    useCommentAuthorReactionsMock.mockReturnValue({ data: new Map() });

    renderWithProviders(<EvaluationSection makgeolliId="m_1" />);

    // 시트 타이틀("코멘트")이 노출되어 있지 않아야 함 (sheetOpen=false 초기 상태)
    expect(
      screen.queryByRole("button", { name: "닫기" }),
    ).not.toBeInTheDocument();
  });

  it("카드를 탭하면 AllPublicCommentsSheet 가 등장한다 (코멘트 타이틀 + 닫기 버튼)", async () => {
    const comments = [makeComment(0), makeComment(1)];
    useReactionMock.mockReturnValue({ counts: { like: 2, dislike: 0 } });
    useDetailCommentsMock.mockReturnValue({
      data: comments,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    useCommentAuthorReactionsMock.mockReturnValue({ data: new Map() });

    renderWithProviders(<EvaluationSection makgeolliId="m_1" />);

    const card = screen.getAllByTestId("evaluation-comment-card")[0];
    await userEvent.click(card);

    // 시트 등장 — 닫기 버튼 노출
    expect(
      screen.getByRole("button", { name: "닫기" }),
    ).toBeInTheDocument();
  });

  it("시트의 닫기 버튼을 누르면 AllPublicCommentsSheet 가 사라진다", async () => {
    const comments = [makeComment(0)];
    useReactionMock.mockReturnValue({ counts: { like: 1, dislike: 0 } });
    useDetailCommentsMock.mockReturnValue({
      data: comments,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    useCommentAuthorReactionsMock.mockReturnValue({ data: new Map() });

    renderWithProviders(<EvaluationSection makgeolliId="m_1" />);

    const card = screen.getAllByTestId("evaluation-comment-card")[0];
    await userEvent.click(card);
    expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(
      screen.queryByRole("button", { name: "닫기" }),
    ).not.toBeInTheDocument();
  });
});
