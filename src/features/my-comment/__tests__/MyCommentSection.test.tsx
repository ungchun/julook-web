import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { MyCommentSection } from "../MyCommentSection";

// 외부 IO wrapper 단일 지점 모킹.
const fetchMyCommentMock = vi.fn();
const upsertMyCommentMock = vi.fn();
const deleteMyCommentMock = vi.fn();

vi.mock("@/shared/lib/user-comments", () => ({
  fetchMyComment: (...args: unknown[]) => fetchMyCommentMock(...args),
  upsertMyComment: (...args: unknown[]) => upsertMyCommentMock(...args),
  deleteMyComment: (...args: unknown[]) => deleteMyCommentMock(...args),
}));

// useUserId 는 케이스마다 값을 바꿔야 하므로 vi.hoisted 로 가변 mock 제공.
const FIXED_USER_ID = "user-fixture-id";
const { useUserIdMock } = vi.hoisted(() => ({
  useUserIdMock: vi.fn<() => string | undefined>(),
}));
vi.mock("@/shared/lib/use-user-id", () => ({
  useUserId: () => useUserIdMock(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  upsertMyCommentMock.mockResolvedValue(undefined);
  deleteMyCommentMock.mockResolvedValue(undefined);
  // 기본값: userId 가 이미 로드된 상태 (대다수 케이스).
  useUserIdMock.mockReturnValue(FIXED_USER_ID);
});

const MAKGEOLLI_ID = "makgeolli-fixture-id";

describe("MyCommentSection", () => {
  it("when user has no comment, renders empty CTA box with placeholder text", async () => {
    fetchMyCommentMock.mockResolvedValue(null);

    renderWithProviders(<MyCommentSection makgeolliId={MAKGEOLLI_ID} />);

    expect(await screen.findByText("내 코멘트")).toBeInTheDocument();
    expect(
      await screen.findByText("터치해서 코멘트를 남겨보세요!"),
    ).toBeInTheDocument();
  });

  it("when empty box is tapped, opens create editor sheet (mode=create)", async () => {
    fetchMyCommentMock.mockResolvedValue(null);

    renderWithProviders(<MyCommentSection makgeolliId={MAKGEOLLI_ID} />);

    const emptyBox = await screen.findByRole("button", {
      name: /터치해서 코멘트를 남겨보세요/,
    });
    await userEvent.click(emptyBox);

    // 시트 헤더 "코멘트 남기기" 등장 (create mode 타이틀)
    expect(
      await screen.findByText("코멘트 남기기"),
    ).toBeInTheDocument();
  });

  it("when user has a comment, renders comment body + date + visibility label + edit button", async () => {
    fetchMyCommentMock.mockResolvedValue({
      id: "c1",
      user_id: FIXED_USER_ID,
      makgeolli_id: MAKGEOLLI_ID,
      comment: "달콤하고 산미가 좋아요",
      is_public: true,
      created_at: "2025-04-15T12:00:00Z",
      updated_at: "2025-04-15T12:00:00Z",
    });

    renderWithProviders(<MyCommentSection makgeolliId={MAKGEOLLI_ID} />);

    expect(
      await screen.findByText("달콤하고 산미가 좋아요"),
    ).toBeInTheDocument();
    expect(screen.getByText("전체공개")).toBeInTheDocument();
    expect(screen.getByText("2025년 4월 15일")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "수정" })).toBeInTheDocument();
  });

  it("displays visibility label '비공개' when is_public=false", async () => {
    fetchMyCommentMock.mockResolvedValue({
      id: "c1",
      user_id: FIXED_USER_ID,
      makgeolli_id: MAKGEOLLI_ID,
      comment: "혼자만 보는 메모",
      is_public: false,
      created_at: "2025-04-15T12:00:00Z",
      updated_at: "2025-04-15T12:00:00Z",
    });

    renderWithProviders(<MyCommentSection makgeolliId={MAKGEOLLI_ID} />);

    expect(await screen.findByText("비공개")).toBeInTheDocument();
    expect(screen.queryByText("전체공개")).not.toBeInTheDocument();
  });

  it("when userId is not yet loaded, renders LoadingState instead of empty CTA (prevents flicker on first Detail mount)", async () => {
    // userId 미로드 상태에서는 빈 CTA placeholder ("터치해서 코멘트를 남겨보세요!") 가
    // 잠깐 보이는 깜빡임이 발생하지 않아야 한다. useMyComment 가 isLoading=true 를
    // 반환하므로 MyCommentSection 은 LoadingState 만 렌더.
    useUserIdMock.mockReturnValue(undefined);
    // fetchMyComment 는 호출되지 않아야 하지만, 만약 호출되더라도 영향 없도록 stub.
    fetchMyCommentMock.mockResolvedValue(null);

    renderWithProviders(<MyCommentSection makgeolliId={MAKGEOLLI_ID} />);

    // 섹션 헤더는 정상 렌더 (이 부분은 데이터 무관).
    expect(await screen.findByText("내 코멘트")).toBeInTheDocument();

    // LoadingState 가 보이고, 빈 CTA 텍스트는 보이지 않아야 한다.
    expect(screen.getByRole("status", { name: "로딩 중" })).toBeInTheDocument();
    expect(
      screen.queryByText("터치해서 코멘트를 남겨보세요!"),
    ).not.toBeInTheDocument();

    // userId 가 미준비이면 fetch 도 호출되면 안 된다.
    expect(fetchMyCommentMock).not.toHaveBeenCalled();
  });

  it("when existing comment box is tapped, opens action sheet (수정하기/삭제하기)", async () => {
    fetchMyCommentMock.mockResolvedValue({
      id: "c1",
      user_id: FIXED_USER_ID,
      makgeolli_id: MAKGEOLLI_ID,
      comment: "달콤하고 산미가 좋아요",
      is_public: true,
      created_at: "2025-04-15T12:00:00Z",
      updated_at: "2025-04-15T12:00:00Z",
    });

    renderWithProviders(<MyCommentSection makgeolliId={MAKGEOLLI_ID} />);

    const editButton = await screen.findByRole("button", { name: "수정" });
    await userEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText("수정하기")).toBeInTheDocument();
      expect(screen.getByText("삭제하기")).toBeInTheDocument();
    });
  });
});
