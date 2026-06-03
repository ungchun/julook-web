import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import { DeleteConfirmDialog } from "../DeleteConfirmDialog";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DeleteConfirmDialog", () => {
  it("renders title '코멘트 삭제' with 취소 / 삭제 actions when open", async () => {
    renderWithProviders(
      <DeleteConfirmDialog open onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(screen.getByText("코멘트 삭제")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
  });

  it("does not render content when open=false", async () => {
    renderWithProviders(
      <DeleteConfirmDialog
        open={false}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.queryByText("코멘트 삭제")).not.toBeInTheDocument();
  });

  it("clicking 삭제 calls onConfirm", async () => {
    const onConfirm = vi.fn();
    renderWithProviders(
      <DeleteConfirmDialog open onConfirm={onConfirm} onCancel={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "삭제" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("clicking 취소 calls onCancel", async () => {
    const onCancel = vi.fn();
    renderWithProviders(
      <DeleteConfirmDialog open onConfirm={vi.fn()} onCancel={onCancel} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
