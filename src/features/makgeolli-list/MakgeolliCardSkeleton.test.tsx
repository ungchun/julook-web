import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MakgeolliCardSkeleton } from "./MakgeolliCardSkeleton";

describe("MakgeolliCardSkeleton", () => {
  it("renders 5 placeholder cards by default", () => {
    render(<MakgeolliCardSkeleton />);
    expect(
      screen.getAllByTestId("makgeolli-card-skeleton"),
    ).toHaveLength(5);
  });

  it("renders the specified count", () => {
    render(<MakgeolliCardSkeleton count={3} />);
    expect(
      screen.getAllByTestId("makgeolli-card-skeleton"),
    ).toHaveLength(3);
  });

  it("exposes status role with 로딩 중 label", () => {
    render(<MakgeolliCardSkeleton />);
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "로딩 중",
    );
  });

  it("when testId is provided, attaches to container", () => {
    render(<MakgeolliCardSkeleton testId="card-skeleton-test" />);
    expect(screen.getByTestId("card-skeleton-test")).toBeInTheDocument();
  });
});
