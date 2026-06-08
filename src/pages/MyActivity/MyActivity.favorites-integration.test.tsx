import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "@/test/utils";
import { MyActivity } from "./MyActivity";

// 통합 RED — useFavoriteMakgeollis 를 모킹하지 않고 실제 hook 을 거치는 시나리오.
// favorites storage 가 비어있을 때(= 찜 0개) /my-activity?tab=favorite 에서
// "비어있어요" EmptyState 가 표시되어야 한다.
//
// 현재 useFavoriteMakgeollis 의 enabled: ids.length > 0 로 인해 data === undefined
// 영구 → CardPane 의 items?.length === 0 분기 발동 못 함 → null 리턴 → 빈 화면.
// → 이 테스트가 RED 인 이유. hook 의 계약을 "data: []" 로 고치면 GREEN.
//
// MyActivity.test.tsx 와 달리 favorites hook 자체를 mock 하지 않으므로
// hook 단의 root cause 가 페이지 렌더에 미치는 영향을 통합으로 검증한다.

// my-activity feature 의 다른 hook 은 가벼운 stub. 단일 모듈 안의 export 라 부분 모킹.
vi.mock("@/features/my-activity", () => ({
  fetchMyAllActivity: vi.fn(),
  useMyAllActivity: () => ({ data: [], isLoading: false, isError: false }),
  useMyReactionActivity: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
  useMyCommentActivity: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
  useMyActivityDecorations: () => ({
    data: {
      reactionByMakgeolliId: new Map(),
      commentSet: new Set(),
      favoriteSet: new Set(),
    },
    isLoading: false,
    isError: false,
  }),
  MyActivityGridCard: (props: { makgeolli: { id: string; name: string } }) => (
    <div data-testid="my-activity-grid-card">{props.makgeolli.name}</div>
  ),
}));

// favorites storage wrapper — 빈 배열 반환. 외부 IO 경계만 mock.
vi.mock("@/shared/lib/favorites-storage", () => ({
  loadFavorites: vi.fn().mockResolvedValue([]),
  saveFavorites: vi.fn().mockResolvedValue(undefined),
}));

// supabase wrapper — 호출되면 안 되지만 모듈 import 안전성 확보용 stub.
vi.mock("@/shared/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
    })),
    storage: {
      from: vi.fn(() => ({
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: "https://t.test/x.png" },
        }),
      })),
    },
  },
}));

vi.mock("@/shared/lib/identity", () => ({
  getOrCreateUserId: () => Promise.resolve("user-fixture-id"),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("MyActivity — favorites empty integration (real hook)", () => {
  it("when ?tab=favorite + favorites storage 가 비어있음, '비어있어요' EmptyState 가 표시된다", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/my-activity" element={<MyActivity />} />
      </Routes>,
      { route: "/my-activity?tab=favorite" },
    );

    // 찜 탭 active 확인
    expect(await screen.findByRole("button", { name: "찜" })).toHaveAttribute(
      "aria-current",
      "true",
    );

    // EmptyState 메시지가 보여야 함 — 현재 hook 버그로 인해 RED.
    expect(await screen.findByText("비어있어요")).toBeInTheDocument();
  });
});
