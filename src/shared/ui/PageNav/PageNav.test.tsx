import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PageNav } from "./PageNav";

describe("PageNav", () => {
  it("title 미지정 시 좌측 닫기 버튼만 렌더", () => {
    render(<PageNav onClose={() => {}} />);
    expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("title 지정 시 중앙 heading 으로 렌더 (iOS navigation bar)", () => {
    render(<PageNav onClose={() => {}} title="특징으로 찾기" />);
    expect(
      screen.getByRole("heading", { name: "특징으로 찾기", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
  });

  it("닫기 클릭 시 onClose 호출", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<PageNav onClose={onClose} title="x" />);
    await user.click(screen.getByRole("button", { name: "닫기" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
