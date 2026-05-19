import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorState } from "./ErrorState";

describe("ErrorState", () => {
  it("renders default message when no message prop is provided", () => {
    render(<ErrorState />);
    expect(
      screen.getByText("잠시 후 다시 시도해주세요"),
    ).toBeInTheDocument();
  });

  it("renders the provided custom message", () => {
    render(<ErrorState message="검색에 실패했어요" />);
    expect(screen.getByText("검색에 실패했어요")).toBeInTheDocument();
  });

  it("when onRetry is not provided, retry button is not rendered", () => {
    render(<ErrorState message="실패" />);
    expect(
      screen.queryByRole("button", { name: "다시 시도" }),
    ).not.toBeInTheDocument();
  });

  it("when onRetry is provided, renders retry button and calls handler on click", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState message="실패" onRetry={onRetry} />);

    const button = screen.getByRole("button", { name: "다시 시도" });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("when testId is provided, attaches data-testid to container", () => {
    render(<ErrorState testId="error-test" />);
    expect(screen.getByTestId("error-test")).toBeInTheDocument();
  });
});
