import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders the provided message", () => {
    render(<EmptyState message="공개된 코멘트가 없어요" />);
    expect(screen.getByText("공개된 코멘트가 없어요")).toBeInTheDocument();
  });

  it("renders search_julook illustration", () => {
    render(<EmptyState message="any" />);
    const img = screen.getByRole("presentation", { hidden: true });
    expect(img).toHaveAttribute(
      "src",
      "/assets/placeholder/search_julook.svg",
    );
  });

  it("when testId is provided, attaches data-testid to container", () => {
    render(<EmptyState message="msg" testId="empty-test" />);
    expect(screen.getByTestId("empty-test")).toBeInTheDocument();
  });
});
