import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CommentRow } from "./CommentRow";
import type { Makgeolli, UserComment } from "@/shared/types";

vi.mock("@/shared/lib/makgeolli-image", () => ({
  getMakgeolliImageUrl: () => "https://example.com/image.png",
}));

const COMMENT: UserComment = {
  id: "c_1",
  user_id: "u_1",
  makgeolli_id: "m_1",
  comment: "테스트 코멘트",
  is_public: true,
  created_at: "2025-04-01T00:00:00Z",
  updated_at: "2025-04-01T00:00:00Z",
};

const MAKGEOLLI: Makgeolli = {
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
};

describe("CommentRow reaction icon", () => {
  it("renders circle_like when reactionType='like'", () => {
    render(
      <CommentRow
        comment={COMMENT}
        makgeolli={MAKGEOLLI}
        onClick={() => {}}
        reactionType="like"
      />,
    );

    const icon = screen.getByTestId("comment-author-reaction");
    expect(icon).toHaveAttribute("src", "/assets/reaction/circle_like.svg");
  });

  it("renders circle_dislike when reactionType='dislike'", () => {
    render(
      <CommentRow
        comment={COMMENT}
        makgeolli={MAKGEOLLI}
        onClick={() => {}}
        reactionType="dislike"
      />,
    );

    const icon = screen.getByTestId("comment-author-reaction");
    expect(icon).toHaveAttribute("src", "/assets/reaction/circle_dislike.svg");
  });

  it("renders circle_none when reactionType is null", () => {
    render(
      <CommentRow
        comment={COMMENT}
        makgeolli={MAKGEOLLI}
        onClick={() => {}}
        reactionType={null}
      />,
    );

    const icon = screen.getByTestId("comment-author-reaction");
    expect(icon).toHaveAttribute("src", "/assets/reaction/circle_none.svg");
  });

  it("does not render reaction icon when reactionType prop is undefined", () => {
    render(
      <CommentRow
        comment={COMMENT}
        makgeolli={MAKGEOLLI}
        onClick={() => {}}
      />,
    );

    expect(
      screen.queryByTestId("comment-author-reaction"),
    ).not.toBeInTheDocument();
  });
});
