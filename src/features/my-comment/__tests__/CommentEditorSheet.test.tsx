import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { CommentEditorSheet } from "../CommentEditorSheet";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CommentEditorSheet", () => {
  it("when mode='create' and text is empty, save button is disabled", async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    renderWithProviders(
      <CommentEditorSheet
        mode="create"
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "저장" });
    expect(saveButton).toBeDisabled();
  });

  it("when mode='create', title is '코멘트 남기기' and placeholder is shown", async () => {
    renderWithProviders(
      <CommentEditorSheet
        mode="create"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("코멘트 남기기")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("막걸리에 대한 생각을 자유롭게 적어주세요."),
    ).toBeInTheDocument();
  });

  it("when mode='edit', title is '코멘트 수정' and initial content/isPublic are prefilled", async () => {
    renderWithProviders(
      <CommentEditorSheet
        mode="edit"
        initialContent="이미 작성된 내용"
        initialIsPublic={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("코멘트 수정")).toBeInTheDocument();
    expect(screen.getByDisplayValue("이미 작성된 내용")).toBeInTheDocument();
    // 비공개 체크박스가 체크된 상태 (isPublic=false → 비공개 checkbox checked)
    const privateCheckbox = screen.getByRole("checkbox", { name: /비공개/ });
    expect(privateCheckbox).toBeChecked();
  });

  it("truncates input to 200 chars when user pastes 201 chars (iOS prefix(200) 미러)", async () => {
    const onSubmit = vi.fn();

    renderWithProviders(
      <CommentEditorSheet
        mode="create"
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    const ta = screen.getByPlaceholderText(
      "막걸리에 대한 생각을 자유롭게 적어주세요.",
    ) as HTMLTextAreaElement;

    // userEvent.type 은 한 글자씩 타이핑 — 201자는 너무 느리므로 paste 로 한번에 입력.
    await userEvent.click(ta);
    await userEvent.paste("a".repeat(201));

    expect(ta.value.length).toBe(200);
  });

  it("when text has content, save button is enabled and clicking calls onSubmit with {comment, isPublic:true}", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <CommentEditorSheet
        mode="create"
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    const ta = screen.getByPlaceholderText(
      "막걸리에 대한 생각을 자유롭게 적어주세요.",
    );
    await userEvent.type(ta, "맛있어요");

    const saveButton = screen.getByRole("button", { name: "저장" });
    expect(saveButton).not.toBeDisabled();
    await userEvent.click(saveButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      comment: "맛있어요",
      isPublic: true,
    });
  });

  it("when 비공개 toggle is checked, onSubmit receives isPublic=false", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <CommentEditorSheet
        mode="create"
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    const ta = screen.getByPlaceholderText(
      "막걸리에 대한 생각을 자유롭게 적어주세요.",
    );
    await userEvent.type(ta, "비밀 메모");

    const privateCheckbox = screen.getByRole("checkbox", { name: /비공개/ });
    await userEvent.click(privateCheckbox);

    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onSubmit).toHaveBeenCalledWith({
      comment: "비밀 메모",
      isPublic: false,
    });
  });

  it("when 취소 button is clicked, onCancel is called", async () => {
    const onCancel = vi.fn();

    renderWithProviders(
      <CommentEditorSheet
        mode="create"
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
