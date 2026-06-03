import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { CommentActionSheet } from "../CommentActionSheet";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CommentActionSheet", () => {
  it("renders 수정하기 / 삭제하기 / 취소 actions when open", async () => {
    renderWithProviders(
      <CommentActionSheet
        open
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "수정하기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "삭제하기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
  });

  it("does not render content when open=false", async () => {
    renderWithProviders(
      <CommentActionSheet
        open={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.queryByText("수정하기")).not.toBeInTheDocument();
    expect(screen.queryByText("삭제하기")).not.toBeInTheDocument();
  });

  it("clicking 수정하기 calls onEdit", async () => {
    const onEdit = vi.fn();
    renderWithProviders(
      <CommentActionSheet
        open
        onEdit={onEdit}
        onDelete={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "수정하기" }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("clicking 삭제하기 calls onDelete (routes to confirm dialog at parent)", async () => {
    const onDelete = vi.fn();
    renderWithProviders(
      <CommentActionSheet
        open
        onEdit={vi.fn()}
        onDelete={onDelete}
        onCancel={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "삭제하기" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("clicking 취소 calls onCancel", async () => {
    const onCancel = vi.fn();
    renderWithProviders(
      <CommentActionSheet
        open
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onCancel={onCancel}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
