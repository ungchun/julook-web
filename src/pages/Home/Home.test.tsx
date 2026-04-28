import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Home } from "./Home";

describe("Home", () => {
  it("renders the brand title", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: "주룩" })).toBeInTheDocument();
  });
});
