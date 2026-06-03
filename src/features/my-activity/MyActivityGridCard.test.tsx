import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Makgeolli } from "@/shared/types";
import { MyActivityGridCard } from "./MyActivityGridCard";

// iOS MyMakgeolliGridItem 1:1 미러 카드의 RED 테스트.
// reaction/comment/favorite 아이콘 3종을 props 분기로 src 결정 + onClick.
//
// MakgeolliImage 는 useEffect/img 로딩 트리거가 있어 실 카드 검증에 noise → mock.
// (testid 검증과 직접 관련 없음)
vi.mock("@/shared/ui/MakgeolliImage", () => ({
  MakgeolliImage: (props: {
    imageName: string | null;
    alt: string;
    className?: string;
  }) => (
    <img
      data-testid="makgeolli-image"
      alt={props.alt}
      data-image-name={props.imageName ?? ""}
      className={props.className}
    />
  ),
}));

function makeMakgeolli(overrides: Partial<Makgeolli> = {}): Makgeolli {
  return {
    id: "m_1",
    name: "느린마을",
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
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("MyActivityGridCard", () => {
  it("renders circle_like icon when reactionType='like'", () => {
    render(
      <MyActivityGridCard
        makgeolli={makeMakgeolli()}
        reactionType="like"
        hasComment={false}
        isFavorite={false}
      />,
    );

    const reactionIcon = screen.getByTestId("reaction-icon") as HTMLImageElement;
    expect(reactionIcon.src).toContain("circle_like.svg");
  });

  it("renders circle_dislike icon when reactionType='dislike'", () => {
    render(
      <MyActivityGridCard
        makgeolli={makeMakgeolli()}
        reactionType="dislike"
        hasComment={false}
        isFavorite={false}
      />,
    );

    const reactionIcon = screen.getByTestId("reaction-icon") as HTMLImageElement;
    expect(reactionIcon.src).toContain("circle_dislike.svg");
  });

  it("renders circle_none icon when reactionType is null", () => {
    render(
      <MyActivityGridCard
        makgeolli={makeMakgeolli()}
        reactionType={null}
        hasComment={false}
        isFavorite={false}
      />,
    );

    const reactionIcon = screen.getByTestId("reaction-icon") as HTMLImageElement;
    expect(reactionIcon.src).toContain("circle_none.svg");
  });

  it("renders comment_fill when hasComment=true, comment_none when false", () => {
    const { rerender } = render(
      <MyActivityGridCard
        makgeolli={makeMakgeolli()}
        reactionType={null}
        hasComment
        isFavorite={false}
      />,
    );

    let commentIcon = screen.getByTestId("comment-icon") as HTMLImageElement;
    expect(commentIcon.src).toContain("comment_fill.svg");

    rerender(
      <MyActivityGridCard
        makgeolli={makeMakgeolli()}
        reactionType={null}
        hasComment={false}
        isFavorite={false}
      />,
    );

    commentIcon = screen.getByTestId("comment-icon") as HTMLImageElement;
    expect(commentIcon.src).toContain("comment_none.svg");
  });

  it("renders heart_fill when isFavorite=true, heart_none when false", () => {
    const { rerender } = render(
      <MyActivityGridCard
        makgeolli={makeMakgeolli()}
        reactionType={null}
        hasComment={false}
        isFavorite
      />,
    );

    let favIcon = screen.getByTestId("favorite-icon") as HTMLImageElement;
    expect(favIcon.src).toContain("heart_fill.svg");

    rerender(
      <MyActivityGridCard
        makgeolli={makeMakgeolli()}
        reactionType={null}
        hasComment={false}
        isFavorite={false}
      />,
    );

    favIcon = screen.getByTestId("favorite-icon") as HTMLImageElement;
    expect(favIcon.src).toContain("heart_none.svg");
  });

  it("renders makgeolli name and uses my-activity-grid-card testid", () => {
    render(
      <MyActivityGridCard
        makgeolli={makeMakgeolli({ name: "느린마을 한 모금" })}
        reactionType="like"
        hasComment
        isFavorite
      />,
    );

    expect(screen.getByTestId("my-activity-grid-card")).toBeInTheDocument();
    expect(screen.getByText("느린마을 한 모금")).toBeInTheDocument();
  });

  it("calls onClick when card is tapped", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <MyActivityGridCard
        makgeolli={makeMakgeolli()}
        reactionType={null}
        hasComment={false}
        isFavorite={false}
        onClick={onClick}
      />,
    );

    await user.click(screen.getByTestId("my-activity-grid-card"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
