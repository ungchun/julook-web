import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import { RandomMakgeolliSection } from "./RandomMakgeolliSection";

const fetchRandomMakgeollisMock = vi.fn();

vi.mock("./api", () => ({
  fetchRandomMakgeollis: () => fetchRandomMakgeollisMock(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("RandomMakgeolliSection", () => {
  it("while loading, renders MakgeolliCardSkeleton placeholders", async () => {
    fetchRandomMakgeollisMock.mockImplementation(
      () => new Promise(() => {}),
    );

    renderWithProviders(<RandomMakgeolliSection />);

    expect(
      await screen.findAllByTestId("makgeolli-card-skeleton"),
    ).not.toHaveLength(0);
  });
});
