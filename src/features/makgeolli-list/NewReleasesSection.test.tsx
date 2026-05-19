import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import { NewReleasesSection } from "./NewReleasesSection";

const fetchNewReleasesMock = vi.fn();

vi.mock("./api", () => ({
  fetchNewReleases: () => fetchNewReleasesMock(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("NewReleasesSection", () => {
  it("while loading, renders MakgeolliCardSkeleton placeholders", async () => {
    fetchNewReleasesMock.mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<NewReleasesSection />);

    expect(
      await screen.findAllByTestId("makgeolli-card-skeleton"),
    ).not.toHaveLength(0);
  });
});
