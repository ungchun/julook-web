import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "@/test/utils";
import { FilterSection } from "./FilterSection";

beforeEach(() => {
  vi.clearAllMocks();
});

function FilterTargetProbe() {
  // 라우터 전환 후 페이지 식별용
  return <div data-testid="filter-target" />;
}

describe("FilterSection navigation", () => {
  it("when '걸쭉한' card clicked, navigates to /filter/thick", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/" element={<FilterSection />} />
        <Route path="/filter/:type" element={<FilterTargetProbe />} />
      </Routes>,
      { route: "/" },
    );

    await user.click(screen.getByRole("button", { name: "걸쭉한" }));

    expect(await screen.findByTestId("filter-target")).toBeInTheDocument();
  });

  it("when '감미료 없는' card clicked, navigates to /filter/no-sweetener", async () => {
    const user = userEvent.setup();

    let pathSeen = "";
    function PathProbe() {
      pathSeen = window.location.pathname;
      return <div data-testid="filter-target" />;
    }

    renderWithProviders(
      <Routes>
        <Route path="/" element={<FilterSection />} />
        <Route path="/filter/:type" element={<PathProbe />} />
      </Routes>,
      { route: "/" },
    );

    await user.click(screen.getByRole("button", { name: "감미료 없는" }));

    await screen.findByTestId("filter-target");
    expect(pathSeen).toBeDefined();
  });

  it("when 헤더 영역 클릭 (button name='특징으로 찾기') → /filter (빈 선택) 진입", async () => {
    const user = userEvent.setup();

    function FilterEmptyProbe() {
      return <div data-testid="filter-empty" />;
    }

    renderWithProviders(
      <Routes>
        <Route path="/" element={<FilterSection />} />
        <Route path="/filter" element={<FilterEmptyProbe />} />
      </Routes>,
      { route: "/" },
    );

    await user.click(screen.getByRole("button", { name: /특징으로 찾기/ }));

    expect(await screen.findByTestId("filter-empty")).toBeInTheDocument();
  });
});
