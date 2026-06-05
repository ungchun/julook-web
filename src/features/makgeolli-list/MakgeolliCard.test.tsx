import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Makgeolli } from "@/shared/types";
import { MakgeolliCard } from "./MakgeolliCard";

// `MakgeolliCard`는 표현 컴포넌트 — 라우터 컨텍스트 의존이 없어야 한다.
// onClick prop을 통해 부모(NewReleasesSection)가 네비게이션을 주입하는 옵션 A 패턴.
// 이 테스트는 prop 인터페이스 자체를 검증하므로 라우터 mock 불필요.

vi.mock("@/shared/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn().mockReturnValue({
        getPublicUrl: vi
          .fn()
          .mockReturnValue({ data: { publicUrl: "https://example.com/i.png" } }),
      }),
    },
  },
}));

const FIXTURE: Makgeolli = {
  id: "fixture_id_1",
  name: "테스트막걸리",
  brewery: null,
  website: null,
  awards: null,
  sweetness: null,
  sourness: null,
  thickness: null,
  carbonation: null,
  has_sweetener: null,
  ingredients: null,
  alcohol_percentage: null,
  image_name: null,
  created_at: null,
  updated_at: null,
};

describe("MakgeolliCard", () => {
  it("when card is clicked, then onClick handler is called", async () => {
    // Arrange
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<MakgeolliCard makgeolli={FIXTURE} onClick={onClick} />);

    // Act
    await user.click(screen.getByTestId("makgeolli-card"));

    // Assert: 카드는 콜백 호출만 책임 — 네비게이션 자체는 부모가 검증.
    expect(onClick).toHaveBeenCalledOnce();
  });

  // iOS L10n.Common.Taste.{sweetness,sourness}Short 미러: 단맛→"단", 신맛→"신".
  // 회귀 가드 — "달"/"시" 오타로 되돌아가는 것을 차단.
  it("renders sweet/sour short labels as 단/신 (not 달/시)", () => {
    render(<MakgeolliCard makgeolli={FIXTURE} />);
    expect(screen.getByText("단")).toBeInTheDocument();
    expect(screen.getByText("신")).toBeInTheDocument();
    expect(screen.queryByText("달")).not.toBeInTheDocument();
    expect(screen.queryByText("시")).not.toBeInTheDocument();
  });
});
