import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecentSearches } from "./RecentSearches";

describe("RecentSearches", () => {
  it("renders title and each recent keyword", () => {
    render(
      <RecentSearches
        items={["느린마을", "지평", "복순도가"]}
        onSelect={vi.fn()}
        onRemove={vi.fn()}
        onClearAll={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "최근 검색어" }),
    ).toBeInTheDocument();
    expect(screen.getByText("느린마을")).toBeInTheDocument();
    expect(screen.getByText("지평")).toBeInTheDocument();
    expect(screen.getByText("복순도가")).toBeInTheDocument();
  });

  it("clicking an item calls onSelect with that keyword", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <RecentSearches
        items={["a", "b"]}
        onSelect={onSelect}
        onRemove={vi.fn()}
        onClearAll={vi.fn()}
      />,
    );

    await user.click(screen.getByText("a"));
    expect(onSelect).toHaveBeenCalledWith("a");
  });

  it("clicking remove button calls onRemove with the index", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <RecentSearches
        items={["a", "b"]}
        onSelect={vi.fn()}
        onRemove={onRemove}
        onClearAll={vi.fn()}
      />,
    );

    const removeButtons = screen.getAllByRole("button", { name: /삭제/ });
    expect(removeButtons).toHaveLength(2);
    await user.click(removeButtons[1]);
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it("clicking 지우기 button calls onClearAll", async () => {
    const user = userEvent.setup();
    const onClearAll = vi.fn();
    render(
      <RecentSearches
        items={["a"]}
        onSelect={vi.fn()}
        onRemove={vi.fn()}
        onClearAll={onClearAll}
      />,
    );

    await user.click(screen.getByRole("button", { name: "지우기" }));
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });
});
