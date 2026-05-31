import { describe, it, expect, vi, beforeEach } from "vitest";
import { Routes, Route, useNavigate } from "react-router-dom";
import { renderWithProviders } from "@/test/utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScrollToTop } from "./ScrollToTop";

let scrollSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  scrollSpy = vi.fn();
  // jsdom 에는 window.scrollTo 가 no-op 으로 정의되어 있어 spy 로 교체
  Object.defineProperty(window, "scrollTo", {
    value: scrollSpy,
    writable: true,
    configurable: true,
  });
});

function Nav({ to, label }: { to: string; label: string }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(to)} type="button">
      {label}
    </button>
  );
}

describe("ScrollToTop", () => {
  it("라우트 변경 시 window.scrollTo(0, 0) 호출", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Nav to="/about" label="go" />} />
          <Route path="/about" element={<div>about</div>} />
        </Routes>
      </>,
      { route: "/" },
    );

    scrollSpy.mockClear();
    await user.click(screen.getByRole("button", { name: "go" }));

    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });

  it("초기 mount 시점에도 (0, 0)으로 호출", () => {
    renderWithProviders(<ScrollToTop />, { route: "/" });
    expect(scrollSpy).toHaveBeenCalledWith(0, 0);
  });
});
