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

const FIXED_USER_ID = "user-fixture-id";
vi.mock("@/shared/lib/use-user-id", () => ({
  useUserId: () => FIXED_USER_ID,
}));

beforeEach(() => {
  vi.clearAllMocks();
  upsertMyCommentMock.mockResolvedValue(undefined);
  deleteMyCommentMock.mockResolvedValue(undefined);
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
