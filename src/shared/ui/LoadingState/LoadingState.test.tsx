import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingState } from "./LoadingState";

describe("LoadingState", () => {
  it("renders a spinner element", () => {
    render(<LoadingState />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("when testId is provided, attaches data-testid to container", () => {
    render(<LoadingState testId="loading-test" />);
    expect(screen.getByTestId("loading-test")).toBeInTheDocument();
  });

  it("has role=status with aria-label for accessibility", () => {
    render(<LoadingState testId="loading-a11y" />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "로딩 중");
  });
});
