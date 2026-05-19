import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CommentRowSkeleton } from "./CommentRowSkeleton";

describe("CommentRowSkeleton", () => {
  it("renders 4 placeholder rows by default (iOS mirror)", () => {
    render(<CommentRowSkeleton />);
    expect(screen.getAllByTestId("comment-skeleton-row")).toHaveLength(4);
  });

  it("renders the specified count of placeholder rows", () => {
    render(<CommentRowSkeleton count={2} />);
    expect(screen.getAllByTestId("comment-skeleton-row")).toHaveLength(2);
  });

  it("exposes a status role for screen readers", () => {
    render(<CommentRowSkeleton />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "로딩 중");
  });

  it("when testId is provided, attaches data-testid to container", () => {
    render(<CommentRowSkeleton testId="skeleton-test" />);
    expect(screen.getByTestId("skeleton-test")).toBeInTheDocument();
  });
});
