import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "@/test/utils";
import { TopicSection } from "./TopicSection";

// useAwards 의 fetch 단일 지점 모킹.
const fetchAwardsMock = vi.fn();

vi.mock("./api", () => ({
  fetchAwards: () => fetchAwardsMock(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

function AwardsTargetProbe() {
  return <div data-testid="awards-target" />;
}

describe("TopicSection navigation", () => {
  it("when award card clicked, navigates to /awards/:awardId", async () => {
    fetchAwardsMock.mockResolvedValue([
      {
        id: "award-uuid-1",
        name: "2024 대한민국 주류대상",
        name_en: null,
        year: 2024,
        type: "korea_award",
      },
    ]);
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/" element={<TopicSection />} />
        <Route path="/awards/:awardId" element={<AwardsTargetProbe />} />
      </Routes>,
      { route: "/" },
    );

    // award.name 은 단어별 줄바꿈으로 렌더되므로 \s+ 로 매칭
    const card = await screen.findByRole("button", {
      name: /2024\s+대한민국\s+주류대상/,
    });
    await user.click(card);

    expect(await screen.findByTestId("awards-target")).toBeInTheDocument();
  });
});
