import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterChips } from "./FilterChips";
import type { FilterSlug } from "./types";

describe("FilterChips", () => {
  it("5개 칩을 모두 렌더한다 (걸쭉/달달/시큼/탄산감 많은/감미료 없는)", () => {
    render(
      <FilterChips
        slugs={["thick", "sweet", "sour", "carbonated", "no-sweetener"]}
        selected={new Set()}
        onToggle={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "걸쭉한" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "달달한" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "시큼한" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "탄산감 많은" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "감미료 없는" }),
    ).toBeInTheDocument();
  });

  it("선택된 칩은 aria-pressed='true', 미선택은 'false'", () => {
    const selected = new Set<FilterSlug>(["sweet"]);
    render(
      <FilterChips
        slugs={["thick", "sweet"]}
        selected={selected}
        onToggle={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "달달한" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "걸쭉한" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("칩 클릭 시 onToggle(slug) 호출", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(
      <FilterChips
        slugs={["thick", "sweet"]}
        selected={new Set()}
        onToggle={onToggle}
      />,
    );

    await user.click(screen.getByRole("button", { name: "달달한" }));

    expect(onToggle).toHaveBeenCalledWith("sweet");
  });
});
