import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { AllPublicCommentsSheet } from "../AllPublicCommentsSheet";
import type { UserComment } from "@/shared/types";

// iOS AllCommentsSheetView 1:1 미러 — Detail 페이지 EvaluationSection 의
// 가로 카드 strip 을 탭하면 등장하는 전체 화면 시트의 RED 케이스.
// 외부 IO 는 useDetailComments / useCommentAuthorReactions 한 단계 위에서 stub.

const useDetailCommentsMock = vi.fn();
const useCommentAuthorReactionsMock = vi.fn();

vi.mock("@/features/detail-comments/use-detail-comments", () => ({
  useDetailComments: (id: string | undefined) => useDetailCommentsMock(id),
}));

vi.mock("@/features/reaction", () => ({
  useCommentAuthorReactions: (comments: UserComment[] | undefined) =>
    useCommentAuthorReactionsMock(comments),
}));

beforeEach(() => {
  vi.clearAllMocks();
  // 기본값: 빈 reaction map (대부분 케이스에서 reaction circle fallback 검증)
  useCommentAuthorReactionsMock.mockReturnValue({ data: new Map() });
});

const MAKGEOLLI_ID = "m_fixture_id";

function makeComment(overrides: Partial<UserComment> = {}): UserComment {
  return {
    id: "c1",
    user_id: "u1",
    makgeolli_id: MAKGEOLLI_ID,
    comment: "맛있어요",
    is_public: true,
    created_at: "2025-04-01T00:00:00Z",
    updated_at: "2025-04-01T00:00:00Z",
    ...overrides,
  };
}

describe("AllPublicCommentsSheet", () => {
  it("renders null when open is false", () => {
    useDetailCommentsMock.mockReturnValue({
      data: [makeComment()],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    const { container } = renderWithProviders(
      <AllPublicCommentsSheet
        open={false}
        makgeolliId={MAKGEOLLI_ID}
        onClose={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
    // open=false 일 때는 hook 자체도 호출되지 않아야 시트가 진짜로 없는 것 (의도 명확화)
    expect(screen.queryByText("코멘트")).not.toBeInTheDocument();
  });

  it("renders '코멘트' as title when open is true", () => {
    useDetailCommentsMock.mockReturnValue({
      data: [makeComment()],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(
      <AllPublicCommentsSheet
        open
        makgeolliId={MAKGEOLLI_ID}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("코멘트")).toBeInTheDocument();
  });

  it("renders each public comment row with body, formatted date, and reaction circle", () => {
    const comments: UserComment[] = [
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
      makeComment({
        id: "c3",
        comment: "달지 않고 깔끔",
        created_at: "2025-02-10T00:00:00Z",
      }),
    ];
    useDetailCommentsMock.mockReturnValue({
      data: comments,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(
      <AllPublicCommentsSheet
        open
        makgeolliId={MAKGEOLLI_ID}
        onClose={vi.fn()}
      />,
    );

    // 본문 3건
    expect(screen.getByText("정말 깔끔하고 맛있어요")).toBeInTheDocument();
    expect(screen.getByText("탄산이 살아있는 느낌")).toBeInTheDocument();
    expect(screen.getByText("달지 않고 깔끔")).toBeInTheDocument();

    // 날짜 formatDateMD = "M월 d일"
    expect(screen.getByText("4월 1일")).toBeInTheDocument();
    expect(screen.getByText("3월 15일")).toBeInTheDocument();
    expect(screen.getByText("2월 10일")).toBeInTheDocument();

    // 행 개수 = 3 (data-testid)
    expect(screen.getAllByTestId("all-public-comment-item")).toHaveLength(3);
  });

  it("renders comments in the order returned by useDetailComments (created_at desc)", () => {
    // mock 이 created_at desc 로 반환 → 화면도 동일 순서
    const comments: UserComment[] = [
      makeComment({ id: "c_latest", comment: "최신 코멘트" }),
      makeComment({ id: "c_middle", comment: "중간 코멘트" }),
      makeComment({ id: "c_oldest", comment: "가장 오래된 코멘트" }),
    ];
    useDetailCommentsMock.mockReturnValue({
      data: comments,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(
      <AllPublicCommentsSheet
        open
        makgeolliId={MAKGEOLLI_ID}
        onClose={vi.fn()}
      />,
    );

    const rows = screen.getAllByTestId("all-public-comment-item");
    expect(rows).toHaveLength(3);
    // 첫 행이 가장 최신
    expect(rows[0]).toHaveTextContent("최신 코멘트");
    expect(rows[1]).toHaveTextContent("중간 코멘트");
    expect(rows[2]).toHaveTextContent("가장 오래된 코멘트");
  });

  it("shows divider between rows but not after the last row", () => {
    const comments: UserComment[] = [
      makeComment({ id: "c1", comment: "A" }),
      makeComment({ id: "c2", comment: "B" }),
      makeComment({ id: "c3", comment: "C" }),
    ];
    useDetailCommentsMock.mockReturnValue({
      data: comments,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(
      <AllPublicCommentsSheet
        open
        makgeolliId={MAKGEOLLI_ID}
        onClose={vi.fn()}
      />,
    );

    // N 행이면 N-1 divider (iOS ForEach 마지막 행 뒤엔 Divider 없음)
    expect(screen.getAllByTestId("all-public-comment-divider")).toHaveLength(2);
  });

  it("shows '공개된 코멘트가 없어요' empty state when there are no public comments", () => {
    useDetailCommentsMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(
      <AllPublicCommentsSheet
        open
        makgeolliId={MAKGEOLLI_ID}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("공개된 코멘트가 없어요")).toBeInTheDocument();
    expect(
      screen.queryByTestId("all-public-comment-item"),
    ).not.toBeInTheDocument();
  });

  it("calls onClose when close button is tapped", async () => {
    const onClose = vi.fn();
    useDetailCommentsMock.mockReturnValue({
      data: [makeComment()],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(
      <AllPublicCommentsSheet
        open
        makgeolliId={MAKGEOLLI_ID}
        onClose={onClose}
      />,
    );

    const closeBtn = screen.getByRole("button", { name: "닫기" });
    await userEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("falls back to circleNone icon when author reaction is unknown", () => {
    const comments: UserComment[] = [
      makeComment({ id: "c_unknown", comment: "리액션 미상" }),
    ];
    useDetailCommentsMock.mockReturnValue({
      data: comments,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    // Map miss → reactions.get(id) === undefined → null 처리 → circleNone
    useCommentAuthorReactionsMock.mockReturnValue({ data: new Map() });

    renderWithProviders(
      <AllPublicCommentsSheet
        open
        makgeolliId={MAKGEOLLI_ID}
        onClose={vi.fn()}
      />,
    );

    const icons = screen.getAllByTestId("all-public-comment-reaction-icon");
    expect(icons).toHaveLength(1);
    expect(icons[0]).toHaveAttribute(
      "src",
      "/assets/reaction/circle_none.svg",
    );
  });
});
