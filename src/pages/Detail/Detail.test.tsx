import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "@/test/utils";
import { Detail } from "./Detail";

// 빈 상세 셸이 `/makgeolli/:id` 라우트로부터 id 파라미터를 받아 화면에 노출하는지 검증.
// D1 사이클은 데이터 페치/시각 디자인 미포함 — id 노출만으로 충분.

describe("Detail page", () => {
  it("when /makgeolli/:id is loaded, then renders detail page with the id", () => {
    // Arrange + Act
    renderWithProviders(
      <Routes>
        <Route path="/makgeolli/:id" element={<Detail />} />
      </Routes>,
      { route: "/makgeolli/abc-123" },
    );

    // Assert: useParams로 받은 id가 화면에 노출됨
    expect(screen.getByTestId("detail-id")).toHaveTextContent("abc-123");
  });
});
